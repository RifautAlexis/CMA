using Dapper;
using Npgsql;
using Wolverine.Http;

namespace CMA.Api.Endpoints;

public class UpdateDeviceEndpoint
{
    [WolverinePatch("/devices/{id}")]
    public static async Task<IResult> UpdateDevice(Guid id, UpdateDeviceRequest request, NpgsqlDataSource dataSource)
    {
        await using var connection = await dataSource.OpenConnectionAsync();

        var updatedDevice = await connection.QuerySingleOrDefaultAsync<UpdateDeviceResponse>(
            """
            UPDATE device
            SET name = @Name,
                ip_address = @NewIpAddress
            WHERE id = @Id
            RETURNING id AS Id, name, ip_address AS IpAddress, created_at AS CreatedAt, updated_at AS UpdatedAt;
            """,
            new
            {
                request.Name,
                NewIpAddress = request.IpAddress,
                Id = id,
            });

        return updatedDevice is null ? Results.NotFound() : Results.Ok(updatedDevice);
    }
}

public class UpdateDeviceRequest
{
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
}

public class UpdateDeviceResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

