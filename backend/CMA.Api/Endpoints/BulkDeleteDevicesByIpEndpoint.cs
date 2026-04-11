using Dapper;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class BulkDeleteDevicesByIpEndpoint
{
    [WolverineDelete("/devices")]
    public static async Task<BulkDeleteDevicesByIpResponse> BulkDeleteDevicesByIp(
        IReadOnlyList<DeleteDeviceByIpRequest> devices,
        NpgsqlDataSource dataSource)
    {
        if (devices.Count == 0)
        {
            return new BulkDeleteDevicesByIpResponse { DeletedCount = 0 };
        }

        await using var connection = await dataSource.OpenConnectionAsync();

        var ipAddresses = devices
            .Select(x => x.IpAddress)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var deletedCount = await connection.ExecuteAsync(
            "DELETE FROM device WHERE ip_address = ANY(@IpAddresses);",
            new { IpAddresses = ipAddresses });

        return new BulkDeleteDevicesByIpResponse
        {
            DeletedCount = deletedCount,
        };
    }
}

public class DeleteDeviceByIpRequest
{
    public required string IpAddress { get; init; }
}

public class BulkDeleteDevicesByIpResponse
{
    public int DeletedCount { get; init; }
}

