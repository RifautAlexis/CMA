using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class ValidateDeviceIpUniquenessEndpoint
{
    [WolverineGet("/devices/ip-address/unique")]
    public static async Task<bool> ValidateDeviceIpUniqueness(
        [FromQuery] string ipAddress,
        NpgsqlDataSource dataSource)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        var existingDeviceId = await connection.QuerySingleOrDefaultAsync<Guid?>(
            """
            SELECT id
            FROM device
            WHERE ip_address = @IpAddress;
            """,
            new
            {
                IpAddress = ipAddress.Trim(),
            });

        return existingDeviceId is null;
    }
}
