using Dapper;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class BulkDeleteDevicesByIdEndpoint
{
    [WolverineDelete("/devices")]
    public static async Task<BulkDeleteDeviceByIdsResponse> BulkDeleteDeviceByIds(
        DeleteDeviceByIdsRequest request,
        NpgsqlDataSource dataSource)
    {

        var ids = request.Ids
            .Distinct()
            .ToArray();
        
        if (ids.Length == 0)
        {
            return new BulkDeleteDeviceByIdsResponse { DeletedCount = 0 };
        }

        await using var connection = await dataSource.OpenConnectionAsync();

        var deletedCount = await connection.ExecuteAsync(
            "DELETE FROM device WHERE id = ANY(@Ids);",
            new { Ids = ids });

        return new BulkDeleteDeviceByIdsResponse
        {
            DeletedCount = deletedCount,
        };
    }
}

public class DeleteDeviceByIdsRequest
{
    public required Guid[] Ids { get; init; }
}

public class BulkDeleteDeviceByIdsResponse
{
    public int DeletedCount { get; init; }
}

