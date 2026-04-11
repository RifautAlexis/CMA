using Dapper;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class GetAllDevicesEndpoint
{
    [WolverineGet("/devices")]
    public static async Task<IReadOnlyList<GetAllDevicesResponse>> GetAllDevices(NpgsqlDataSource dataSource)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        var result = await connection.QueryAsync<GetAllDevicesResponse>(
            "SELECT name, ip_address AS IpAddress, created_at as CreatedAt, updated_at as UpdatedAt FROM device ORDER BY name");

        return result.ToList();
    }
}

public class GetAllDevicesResponse
{
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}