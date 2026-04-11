using Dapper;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class CreateDeviceEndpoint
{
    [WolverinePost("/devices")]
    public static async Task<CreateDeviceResponse> CreateDevice(CreateDeviceRequest request, NpgsqlDataSource dataSource)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        var result = await connection.QuerySingleAsync<CreateDeviceResponse>(
            """
            INSERT INTO device (name, ip_address)
            VALUES (@Name, @IpAddress)
            RETURNING name, ip_address AS IpAddress, created_at AS CreatedAt, updated_at AS UpdatedAt;
            """,
            new
            {
                request.Name,
                request.IpAddress,
            });

        return result;
    }
}

public class CreateDeviceRequest
{
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
}

public class CreateDeviceResponse
{
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}