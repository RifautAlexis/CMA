using CMA.Core;
using Microsoft.AspNetCore.Mvc;
using Wolverine.Http;

namespace CMA.Api.Endpoints.Devices;

public class GetDeviceByIdEndpoint
{
    public static ProblemDetails Validate(GetDeviceByIdRequest request)
    {
        if (request.Id == Guid.Empty)
        {
            return new ProblemDetails
            {
                Status = 400,
                Title = "Invalid request",
                Detail = "Device ID cannot be empty.",
            };
        }

        return WolverineContinue.NoProblems;
    }

    public static async Task<ProblemDetails> ValidateAsync(GetDeviceByIdRequest request,
        IDeviceQueryRepository repository)
    {
        var isDeviceIdExist = await repository.IsIdExistAsync(request.Id, CancellationToken.None);
        if (!isDeviceIdExist)
        {
            return new ProblemDetails
            {
                Status = 400,
                Title = "Invalid Device ID",
                Detail = "Device ID does not exist.",
            };
        }

        return WolverineContinue.NoProblems;
    }
    
    [WolverineGet("/devices/{id}")]
    public static async Task<GetDeviceByIdResponse> GetDeviceById(GetDeviceByIdRequest request, IDeviceQueryRepository repository)
    {
        GetDeviceByIdResponse device = await repository.GetByIdAsync(request.Id, CancellationToken.None);
        return device;
    }
}

public abstract class GetDeviceByIdRequest
{
    public required Guid Id { get; init; }
}

public class GetDeviceByIdResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public SnmpSettings? Snmp { get; set; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public IReadOnlyCollection<DeviceProtocolDetails>? Protocols { get; init;  }
}