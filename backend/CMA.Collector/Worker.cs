using CMA.Core;
using Microsoft.Extensions.Options;
using Npgsql;

namespace CMA.Collector;

public class Worker : BackgroundService
{
    private static readonly TimeSpan InitialRetryDelay = TimeSpan.FromSeconds(2);
    private static readonly TimeSpan MaxRetryDelay     = TimeSpan.FromSeconds(30);

    private readonly ILogger<Worker> _logger;
    private readonly IDeviceQueryRepository _deviceRepository;
    private readonly IReadOnlyList<IDeviceAdapter> _adapters;
    private readonly CollectorSettings _settings;
    private readonly Dictionary<Guid, Device> _trackedDevices = new();

    public Worker(
        ILogger<Worker> logger,
        IOptions<CollectorSettings> options,
        IDeviceQueryRepository deviceRepository,
        IEnumerable<IDeviceAdapter> adapters)
    {
        _logger           = logger;
        _settings         = options.Value;
        _deviceRepository = deviceRepository;
        _adapters         = adapters.ToList();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // ── 2. Main polling loop ─────────────────────────────────────────────
        var retryDelay = InitialRetryDelay;

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Collector cycle started at {time}", DateTimeOffset.UtcNow);

            try
            {
                await SynchronizeDevicesAsync(stoppingToken);
                retryDelay = InitialRetryDelay;
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested && IsTransient(ex))
            {
                _logger.LogWarning(
                    ex,
                    "Device synchronization failed due to a transient error. Retrying in {Delay}s.",
                    retryDelay.TotalSeconds);
                await Task.Delay(retryDelay, stoppingToken);
                retryDelay = NextDelay(retryDelay);
                continue;
            }

            await PollTrackedDevicesAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(_settings.PollingIntervalSeconds), stoppingToken);
        }
    }

    private async Task SynchronizeDevicesAsync(CancellationToken cancellationToken)
    {
        var databaseDevices = await _deviceRepository.GetAllAsync(cancellationToken);
        var current = databaseDevices.ToDictionary(d => d.Id);

        foreach (var device in current.Values.Where(d => !_trackedDevices.ContainsKey(d.Id)))
        {
            _trackedDevices[device.Id] = device;
            _logger.LogInformation("Device added to polling: {Name} ({IpAddress})", device.Name, device.IpAddress);
        }

        foreach (var id in _trackedDevices.Keys.Where(id => !current.ContainsKey(id)).ToList())
        {
            _trackedDevices.Remove(id);
            _logger.LogInformation("Device removed from polling: {DeviceId}", id);
        }

        // Refresh updated devices
        foreach (var device in current.Values.Where(d => _trackedDevices.ContainsKey(d.Id)))
        {
            _trackedDevices[device.Id] = device;
        }
    }

    private async Task PollTrackedDevicesAsync(CancellationToken cancellationToken)
    {
        foreach (var device in _trackedDevices.Values)
        {
            var eligible = _adapters.Where(a => a.CanPoll(device)).ToArray();
            if (eligible.Length == 0)
            {
                _logger.LogWarning("No adapter can poll device {DeviceId} ({Name}).", device.Id, device.Name);
                continue;
            }

            foreach (var adapter in eligible)
            {
                var result = await adapter.PollAsync(device, cancellationToken);
                if (result.Success)
                    _logger.LogInformation("Polling succeeded for {DeviceId}: {Message}", device.Id, result.Message);
                else
                    _logger.LogError("Polling failed for {DeviceId}: {Message}", device.Id, result.Message);
            }
        }
    }

    private static bool IsTransient(Exception ex) =>
        ex is NpgsqlException { IsTransient: true }
        || (ex.InnerException is not null && IsTransient(ex.InnerException));

    private static TimeSpan NextDelay(TimeSpan current) =>
        TimeSpan.FromSeconds(Math.Min(current.TotalSeconds * 2, MaxRetryDelay.TotalSeconds));
}

