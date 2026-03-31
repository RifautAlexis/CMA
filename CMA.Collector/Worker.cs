using CMA.Adapters.Snmp;
using Microsoft.Extensions.Options;

namespace CMA.Collector;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly ISnmpAdapter _snmpAdapter = new SnmpAdapter();
    private readonly CollectorSettings _settings;
    

    public Worker(ILogger<Worker> logger, IOptions<CollectorSettings> options)
    {
        _logger = logger;
        _settings = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    { 
        while (!stoppingToken.IsCancellationRequested)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                
                var device = new Core.Device { Name = "Device 01", IpAddress = "127.0.0.1" };
                _snmpAdapter.AddDevice(device);
                
                await _snmpAdapter.CollectAsync().ContinueWith(task =>
                {
                    if (task.IsCompletedSuccessfully)
                    {
                        _logger.LogInformation("Collected data: {data}", task.Result);
                    }
                    else
                    {
                        _logger.LogError(task.Exception, "Error collecting SNMP data");
                    }
                }, stoppingToken);
            }

            await Task.Delay(TimeSpan.FromSeconds(_settings.PollingIntervalSeconds), stoppingToken);
        }
    }
}