using CMA.Adapters.Snmp;
using CMA.Collector;
using CMA.Core;
using Npgsql;

var builder = Host.CreateApplicationBuilder(args);

var basePath = AppContext.BaseDirectory;
var environmentName = builder.Environment.EnvironmentName;

builder.Configuration
    .AddJsonFile(Path.Combine(basePath, "appsettings.Shared.json"), optional: false, reloadOnChange: true)
    .AddJsonFile(Path.Combine(basePath, $"appsettings.{environmentName}.Shared.json"), optional: true, reloadOnChange: true);

var connectionString = builder.Configuration.GetConnectionString("PostgresAdmin")
                       ?? throw new InvalidOperationException("Connection string 'PostgresAdmin' is missing.");

var postgresPasswordFile = builder.Configuration["POSTGRES_PASSWORD_FILE"];
if (!string.IsNullOrWhiteSpace(postgresPasswordFile))
{
    var connectionStringBuilder = new NpgsqlConnectionStringBuilder(connectionString)
    {
        Host = builder.Configuration["POSTGRES_HOST"] ?? "db",
        Port = int.TryParse(builder.Configuration["POSTGRES_PORT"], out var port) ? port : 5432,
        Database = builder.Configuration["POSTGRES_DB"],
        Username = builder.Configuration["POSTGRES_USER"],
        Password = File.ReadAllText(postgresPasswordFile).Trim(),
    };

    connectionString = connectionStringBuilder.ConnectionString;
}

builder.Services.Configure<CollectorSettings>(
    builder.Configuration.GetSection(CollectorSettings.SectionName));

builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.Services.AddSingleton<PostgresDeviceRepository>();
builder.Services.AddSingleton<IDeviceQueryRepository>(sp => sp.GetRequiredService<PostgresDeviceRepository>());
builder.Services.AddSingleton<IDeviceAdapter, SnmpAdapter>();

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();