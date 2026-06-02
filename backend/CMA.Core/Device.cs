namespace CMA.Core;

public class Device
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public SnmpSettings? Snmp { get; set; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public class SnmpSettings
{
    public int Port { get; set;  }
    public string Version { get; set;  }
    public string Mib2Branch { get; set;  }
    public string ReadCommunity { get; set;  }
    public string WriteCommunity { get; set;  }
}

public class DeviceDetails
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public SnmpSettings? Snmp { get; set; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public IReadOnlyCollection<DeviceProtocolDetails>? Protocols { get; init;  }
}

public class DeviceProtocolDetails
{
    public required string Name { get; init; }
    public required DeviceProtocolConfig Config { get; init; }
}

public abstract class DeviceProtocolConfig
{
}
    
public class DeviceSnmpConfig : DeviceProtocolConfig
{
    public int Port { get; init; }
    public string Version { get; init; }
    public string Mib2Branch { get; init; }
    public string ReadCommunity { get; init; }
    public string WriteCommunity { get; init; }
}