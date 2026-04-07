using CMA.Core;
using Dapper;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class GetAllDevicesEndpoint
{
    [WolverineGet("/device")]
    public static async Task<IReadOnlyList<Device>> GetAllDevices(NpgsqlDataSource dataSource)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        var result = await connection.QueryAsync<Device>(
            "SELECT name, ip_address AS IpAddress, created_at as CreatedAt, updated_at as UpdatedAt FROM device ORDER BY name");

        return result.ToList();
    }
}