namespace CMA.Core;

public interface IDeviceQueryRepository
{
    Task<IReadOnlyList<Device>> GetAllAsync(CancellationToken cancellationToken);
    Task<DeviceDetails?> GetByIdAsync(Guid deviceId, CancellationToken cancellationToken);
    Task<bool> IsIpUniqueAsync(string ipAddress, Guid? excludedDeviceId, CancellationToken cancellationToken);
    Task<bool> IsIdExistAsync(Guid deviceId, CancellationToken cancellationToken);
}

public interface IDeviceCommandRepository
{
    Task<Device> CreateAsync(CreateDeviceInput input, CancellationToken cancellationToken);
    Task<Device?> UpdateAsync(Guid id, UpdateDeviceInput input, CancellationToken cancellationToken);
    Task<Device?> DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<int> DeleteManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken);
}

public sealed class CreateDeviceInput
{
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public required SnmpSettingsInput? SnmpSettings { get; init; }
}

public class SnmpSettingsInput
{
    public required int SnmpPort { get; init; }
    public required int SnmpVersion { get; init; }
    public required string Mib2Branch { get; init; }
    public required string ReadCommunity{ get; init; }
    public required string WriteCommunity{ get; init; }
}

public sealed class UpdateDeviceInput
{
    public string? Name { get; init; }
    public string? IpAddress { get; init; }
    public UpdateSnmpSettingsInput? SnmpSettings { get; init; }
}

public sealed class UpdateSnmpSettingsInput
{
    public int? SnmpPort { get; init; }
    public int? SnmpVersion { get; init; }
    public string? Mib2Branch { get; init; }
    public string? ReadCommunity { get; init; }
    public string? WriteCommunity { get; init; }
}
