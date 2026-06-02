using CMA.Core;
using Microsoft.AspNetCore.Mvc;
using Wolverine.Http;

namespace CMA.Api.Endpoints.Devices;

public class BulkDeleteDevicesByIdEndpoint
{
    public static ProblemDetails Validate(DeleteDeviceByIdsRequest request)
    {
        if (request.Ids.Length == 0)
        {
            return new ProblemDetails
            {
                Status = 400,
                Title = "Invalid request",
                Detail = "At least one device ID is required.",
            };
        }

        return WolverineContinue.NoProblems;
    }
    
    [WolverineDelete("/devices")]
    public static async Task<BulkDeleteDeviceByIdsResponse> BulkDeleteDeviceByIds(
        DeleteDeviceByIdsRequest request,
        IDeviceCommandRepository repository)
    {

        var ids = request.Ids
            .Distinct()
            .ToArray();
        
        if (ids.Length == 0)
        {
            return new BulkDeleteDeviceByIdsResponse { DeletedCount = 0 };
        }

        var deletedCount = await repository.DeleteManyAsync(ids, CancellationToken.None);

        return new BulkDeleteDeviceByIdsResponse
        {
            DeletedCount = deletedCount,
        };
    }
}

public abstract class DeleteDeviceByIdsRequest
{
    public required Guid[] Ids { get; init; }
}

public class BulkDeleteDeviceByIdsResponse
{
    public int DeletedCount { get; init; }
}

