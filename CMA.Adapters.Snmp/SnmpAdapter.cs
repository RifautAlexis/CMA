using CMA.Core;

namespace CMA.Adapters.Snmp;

public interface ISnmpAdapter
{
    Task<string> CollectAsync(Device device);
}

public class SnmpAdapter: ISnmpAdapter
{
    Task<string> ISnmpAdapter.CollectAsync(Device device)
    {
        Console.WriteLine($"Collecting SNMP data from device {device.Name} at {device.IpAddress}");
        return Task.FromResult("Cheval Blanc");
    }
}