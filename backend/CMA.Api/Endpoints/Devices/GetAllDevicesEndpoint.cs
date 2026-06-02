using CMA.Core;
using Wolverine.Http;

namespace CMA.Api.Endpoints.Devices;

public class GetAllDevicesEndpoint
{
    [WolverineGet("/devices")]
    public static async Task<IReadOnlyList<GetAllDevicesResponse>> GetAllDevices(IDeviceQueryRepository repository)
    {
        var devices = await repository.GetAllAsync(CancellationToken.None);
        return devices.Select(GetAllDevicesResponse.FromDevice).ToList();
    }
}

public class GetAllDevicesResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public static GetAllDevicesResponse FromDevice(Device device)
    {
        return new GetAllDevicesResponse
        {
            Id = device.Id,
            Name = device.Name,
            IpAddress = device.IpAddress,
            CreatedAt = device.CreatedAt,
            UpdatedAt = device.UpdatedAt,
        };
    }
}