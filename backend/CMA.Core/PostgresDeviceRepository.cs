using System.Text.Json;
using Dapper;
using Npgsql;

namespace CMA.Core;

public sealed class PostgresDeviceRepository(NpgsqlDataSource dataSource)
    : IDeviceQueryRepository, IDeviceCommandRepository
{
    // ── Catalog reader ────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<Device>> GetAllAsync(CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        const string sql =
            """
            SELECT
                d.id          AS Id,
                d.name        AS Name,
                d.ip_address  AS IpAddress,
                d.created_at  AS CreatedAt,
                d.updated_at  AS UpdatedAt
            FROM device d
            ORDER BY d.name;
            """;

        var rows = await connection.QueryAsync<DeviceRow>(
            new CommandDefinition(sql, cancellationToken: cancellationToken));

        return rows.Select(MapToDevice).ToList();
    }

    public async Task<Device?> GetByIdAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        const string sql =
            """
            SELECT d.id,
                d.name,
                d.ip_address,
                d.created_at,
                d.updated_at,
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'name', lower(cp.code),
                            'config',
                            CASE
                                WHEN cp.code = 'SNMP' THEN jsonb_build_object(
                                        'port', dps.port,
                                        'version', dps.version,
                                        'mib2Branch', dps.mib_2_branch,
                                        'readCommunity', dps.read_community,
                                        'writeCommunity', dps.write_community
                                    )
                                -- WHEN cp.code = 'HTTP' THEN jsonb_build_object(...)
                                --WHEN cp.code = 'MODBUS' THEN jsonb_build_object(...)
                                ELSE '{}'::jsonb
                            END
                        )
                    ) FILTER(WHERE dp.id IS NOT NULL),
                    '[]'::jsonb
                ) AS protocols
            FROM device d
                LEFT JOIN device_protocol dp
                    ON dp.device_id = d.id
                LEFT JOIN communication_protocol cp
                    ON cp.id = dp.protocol_id
                LEFT JOIN device_protocol_snmp dps
                    ON dps.device_protocol_id = dp.id
            WHERE d.id = @Id
            GROUP BY d.id, d.name, d.ip_address, d.created_at, d.updated_at;
        """;

        var row = await connection.QuerySingleOrDefaultAsync<DeviceDetailsRow>(
            new CommandDefinition(sql,
                new { Id = deviceId },
                cancellationToken: cancellationToken));

        return row is null ? null : MapToDevice(row);
    }

    public async Task<bool> IsIpUniqueAsync(string ipAddress, Guid? excludedDeviceId,
        CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        var sql = excludedDeviceId is null
            ? "SELECT id FROM device WHERE ip_address = @IpAddress;"
            : "SELECT id FROM device WHERE ip_address = @IpAddress AND id <> @ExcludedId;";

        var existing = await connection.QuerySingleOrDefaultAsync<Guid?>(new CommandDefinition(
            sql,
            new { IpAddress = ipAddress.Trim(), ExcludedId = excludedDeviceId },
            cancellationToken: cancellationToken));

        return existing is null;
    }

    public async Task<bool> IsIdExistAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        const string sql = "SELECT FROM device WHERE id = @Id";

        var existing = await connection.QuerySingleOrDefaultAsync<Guid?>(new CommandDefinition(
            sql,
            new { Id = deviceId },
            cancellationToken: cancellationToken));

        return existing is null;
    }

    // ── Command repository ────────────────────────────────────────────────────

    public async Task<Device> CreateAsync(CreateDeviceInput input, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(input);

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var tx = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            // Insert the device
            const string insertDeviceSql =
                """
                INSERT INTO device (name, ip_address)
                VALUES (@Name, @IpAddress)
                RETURNING
                    id         AS Id,
                    name       AS Name,
                    ip_address AS IpAddress,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt;
                """;

            var deviceRow = await connection.QuerySingleAsync<DeviceRow>(new CommandDefinition(
                insertDeviceSql,
                new { Name = input.Name.Trim(), IpAddress = input.IpAddress.Trim() },
                tx,
                cancellationToken: cancellationToken));

            // Insert the device protocols
            const string insertDeviceProtocolSql =
                """
                INSERT INTO device_protocol (device_id, protocol_id)
                SELECT @DeviceId, cp.id
                FROM   communication_protocol cp
                WHERE  cp.code = 'SNMP'
                ON CONFLICT (device_id, protocol_id) DO NOTHING
                RETURNING
                    id         AS Id,
                    device_id       AS DeviceId,
                    protocol_id AS ProtocolId,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt;
                """;

            var deviceProtocolRow = await connection.QuerySingleAsync<DeviceProtocolRow>(new CommandDefinition(
                insertDeviceProtocolSql,
                new { DeviceId = deviceRow.Id },
                tx,
                cancellationToken: cancellationToken));

            // If SNMP settings are provided, set them up
            SnmpSettings? snmpSettings = null;
            if (input.SnmpSettings is not null)
            {
                const string insertSnmpSettingsSql =
                    """
                    INSERT INTO device_protocol_snmp (device_protocol_id, port, version, mib_2_branch, read_community, write_community)
                    VALUES (@DeviceProtocolId, @Port, @Version, @Mib2Branch, @ReadCommunity, @WriteCommunity)
                    RETURNING
                        device_protocol_id AS DeviceProtocolId,
                        port AS Port,
                        version AS Version,
                        mib_2_branch AS Mib2Branch,
                        read_community AS ReadCommunity,
                        write_community AS WriteCommunity;
                    """;

                var snmpSettingsRow = await connection.QuerySingleOrDefaultAsync<SnmpSettingsRow>(new CommandDefinition(
                    insertSnmpSettingsSql,
                    new
                    {
                        DeviceProtocolId = deviceProtocolRow.Id,
                        Port = input.SnmpSettings.SnmpPort,
                        Version = input.SnmpSettings.SnmpVersion,
                        Mib2Branch = input.SnmpSettings.Mib2Branch.Trim(),
                        ReadCommunity = input.SnmpSettings.ReadCommunity.Trim(),
                        WriteCommunity = input.SnmpSettings.WriteCommunity.Trim(),
                    },
                    tx,
                    cancellationToken: cancellationToken));

                if (snmpSettingsRow is null)
                {
                    throw new InvalidOperationException("SNMP protocol configuration is missing.");
                }

                snmpSettings = MapToSnmpSettings(snmpSettingsRow);
            }

            await tx.CommitAsync(cancellationToken);

            var device = MapToDevice(deviceRow);
            device.Snmp = snmpSettings;
            return device;
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Device?> UpdateAsync(Guid id, UpdateDeviceInput input, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(input);

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var tx = await connection.BeginTransactionAsync(cancellationToken);

        var hasSnmpUpdate = input.SnmpSettings is not null && HasAnySnmpUpdate(input.SnmpSettings);

        const string sql =
            """
            UPDATE device
            SET
                name = COALESCE(@Name, name),
                ip_address = COALESCE(@IpAddress, ip_address)
            WHERE id = @Id
            RETURNING
                id         AS Id,
                name       AS Name,
                ip_address AS IpAddress,
                created_at AS CreatedAt,
                updated_at AS UpdatedAt;
            """;

        try
        {
            var row = await connection.QuerySingleOrDefaultAsync<DeviceRow>(new CommandDefinition(
                sql,
                new { Id = id, Name = Normalize(input.Name), IpAddress = Normalize(input.IpAddress) },
                tx,
                cancellationToken: cancellationToken));

            if (row is null)
            {
                await tx.RollbackAsync(cancellationToken);
                return null;
            }

            if (hasSnmpUpdate)
            {
                const string snmpUpdateSql =
                    """
                    UPDATE device_protocol_snmp dps
                    SET
                        port = COALESCE(@Port, dps.port),
                        version = COALESCE(@Version, dps.version),
                        mib_2_branch = COALESCE(@Mib2Branch, dps.mib_2_branch),
                        read_community = COALESCE(@ReadCommunity, dps.read_community),
                        write_community = COALESCE(@WriteCommunity, dps.write_community)
                    FROM device_protocol dp
                    INNER JOIN communication_protocol cp ON cp.id = dp.protocol_id
                    WHERE dps.device_protocol_id = dp.id
                      AND dp.device_id = @DeviceId
                      AND cp.code = 'SNMP';
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    snmpUpdateSql,
                    new
                    {
                        DeviceId = id,
                        Port = input.SnmpSettings!.SnmpPort,
                        Version = input.SnmpSettings.SnmpVersion,
                        Mib2Branch = Normalize(input.SnmpSettings.Mib2Branch),
                        ReadCommunity = Normalize(input.SnmpSettings.ReadCommunity),
                        WriteCommunity = Normalize(input.SnmpSettings.WriteCommunity),
                    },
                    tx,
                    cancellationToken: cancellationToken));
            }

            await tx.CommitAsync(cancellationToken);
            return MapToDevice(row);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Device?> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        const string sql =
            """
            DELETE FROM device WHERE id = @Id
            RETURNING
                id         AS Id,
                name       AS Name,
                ip_address AS IpAddress,
                created_at AS CreatedAt,
                updated_at AS UpdatedAt;
            """;

        var row = await connection.QuerySingleOrDefaultAsync<DeviceRow>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));

        return row is null ? null : MapToDevice(row);
    }

    public async Task<int> DeleteManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0) return 0;

        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);

        return await connection.ExecuteAsync(new CommandDefinition(
            "DELETE FROM device WHERE id = ANY(@Ids);",
            new { Ids = ids.ToArray() },
            cancellationToken: cancellationToken));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static bool HasAnySnmpUpdate(UpdateSnmpSettingsInput input) =>
        input.SnmpPort is not null ||
        input.SnmpVersion is not null ||
        input.Mib2Branch is not null ||
        input.ReadCommunity is not null ||
        input.WriteCommunity is not null;

    private static Device MapToDevice(DeviceRow row) => new()
    {
        Id = row.Id,
        Name = row.Name,
        IpAddress = row.IpAddress,
        CreatedAt = row.CreatedAt,
        UpdatedAt = row.UpdatedAt,
    };
    
    private static DeviceDetails MapToDevice(DeviceDetailsRow row)
    {
        var protocols = JsonSerializer.Deserialize<IReadOnlyList<DeviceProtocolDetails>>(
            row.Protocols) ?? [];
        
        impelment a switch here for protocols

        return new DeviceDetails
        {
            Id = row.Id,
            Name = row.Name,
            IpAddress = row.IpAddress,
            CreatedAt = row.CreatedAt,
            UpdatedAt = row.UpdatedAt,
            Protocols = protocols,
        };
    }

    private static SnmpSettings MapToSnmpSettings(SnmpSettingsRow row) => new()
    {
        Port = row.Port,
        Version = row.Version,
        Mib2Branch = row.Mib2Branch,
        ReadCommunity = row.ReadCommunity,
        WriteCommunity = row.WriteCommunity,
    };

    // ── Dapper row types ──────────────────────────────────────────────────────

    private sealed class DeviceRow
    {
        public Guid Id { get; init; }
        public required string Name { get; init; }
        public required string IpAddress { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }
    
    private sealed class DeviceDetailsRow
    {
        public Guid Id { get; init; }
        public required string Name { get; init; }
        public required string IpAddress { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public required string? Protocols { get; init; }
    }
    
    private sealed class DeviceProtocolDetails
    {
        public required string Name { get; init; }
        public required JsonElement Config { get; init; }
    }

    private sealed class DeviceProtocolRow
    {
        public Guid Id { get; init; }
        public required Guid DeviceId { get; init; }
        public required int ProtocolId { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
    }

    private sealed class SnmpSettingsRow
    {
        public Guid DeviceProtocolId { get; init; }
        public int Port { get; init; }
        public string Version { get; init; }
        public string Mib2Branch { get; init; }
        public string ReadCommunity { get; init; }
        public string WriteCommunity { get; init; }
    }
}