using CMA.Adapters.Snmp;

namespace CMA.Collector;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (_logger.IsEnabled(LogLevel.Information))
            {
                _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                
                ISnmpAdapter snmpAdapter = new SnmpAdapter();
                var device = new Core.Device { Name = "Device 01", IpAddress = "127.0.0.1" };
                await snmpAdapter.CollectAsync(device).ContinueWith(task =>
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

            await Task.Delay(1000, stoppingToken);
        }
    }
}