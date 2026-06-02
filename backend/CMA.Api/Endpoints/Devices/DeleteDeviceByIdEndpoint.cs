using CMA.Core;
using Microsoft.AspNetCore.Mvc;
using Wolverine.Http;

namespace CMA.Api.Endpoints.Devices;

public class DeleteDeviceByIdEndpoint
{
    public static ProblemDetails Validate(DeleteDeviceByIdRequest request)
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
    
    [WolverineDelete("/devices/{id}")]
    public static async Task<IResult> DeleteDeviceById(DeleteDeviceByIdRequest request, IDeviceCommandRepository repository)
    {
        var deletedDevice = await repository.DeleteAsync(request.Id, CancellationToken.None);

        return deletedDevice is null ? Results.NotFound() : Results.Ok(DeleteDeviceByIdResponse.FromDevice(deletedDevice));
    }
}

public abstract class DeleteDeviceByIdRequest
{
    public required Guid Id { get; init; }
}

public class DeleteDeviceByIdResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public static DeleteDeviceByIdResponse FromDevice(Device device)
    {
        return new DeleteDeviceByIdResponse
        {
            Id = device.Id,
            Name = device.Name,
            IpAddress = device.IpAddress,
            CreatedAt = device.CreatedAt,
            UpdatedAt = device.UpdatedAt,
        };
    }
}

