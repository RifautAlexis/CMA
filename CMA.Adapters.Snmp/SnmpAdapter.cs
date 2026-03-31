using CMA.Core;

namespace CMA.Adapters.Snmp;

public interface ISnmpAdapter
{
    Task<string> CollectAsync();
    bool AddDevice(Device device);
}

public class SnmpAdapter: ISnmpAdapter
{
    private readonly ISet<Device> _devices = new HashSet<Device>();
    
    Task<string> ISnmpAdapter.CollectAsync()
    {
        // Simulate SNMP data collection
        return Task.FromResult("SNMP data collected successfully.");
    }

    bool ISnmpAdapter.AddDevice(Device device)
    {
        ArgumentNullException.ThrowIfNull(device);

        if (string.IsNullOrWhiteSpace(device.IpAddress))
        {
            throw new ArgumentException("Device IP address is required.", nameof(device));
        }

        var isAdded = _devices.Add(device);
        Console.WriteLine(isAdded
            ? $"Device {device.Name} added to SNMP adapter."
            : $"Device {device.Name} is already in the SNMP adapter.");
        
        return isAdded;
    }
}