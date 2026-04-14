using Dapper;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class DeleteDeviceByIpAddressEndpoint
{
    [WolverineDelete("/devices/{id}")]
    public static async Task<IResult> DeleteDeviceByIpAddress(Guid id, NpgsqlDataSource dataSource)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        var deletedDevice = await connection.QuerySingleOrDefaultAsync<DeleteDeviceByIpAddressResponse>(
            """
            DELETE FROM device
            WHERE id = @Id
            RETURNING id AS Id, name, ip_address AS IpAddress, created_at AS CreatedAt, updated_at AS UpdatedAt;
            """,
            new { Id = id });

        return deletedDevice is null ? Results.NotFound() : Results.Ok(deletedDevice);
    }
}

public class DeleteDeviceByIpAddressResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

