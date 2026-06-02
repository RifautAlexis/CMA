namespace CMA.Core;

public interface IDeviceAdapter
{
    bool CanPoll(Device device);
    Task<AdapterPollResult> PollAsync(Device device, CancellationToken cancellationToken);
}

public sealed class AdapterPollResult
{
    public required Guid DeviceId { get; init; }
    public required bool Success { get; init; }
    public required string Message { get; init; }

    public static AdapterPollResult Succeeded(Guid deviceId, string message) =>
        new()
        {
            DeviceId = deviceId,
            Success = true,
            Message = message,
        };

    public static AdapterPollResult Failed(Guid deviceId, string message) =>
        new()
        {
            DeviceId = deviceId,
            Success = false,
            Message = message,
        };
}


