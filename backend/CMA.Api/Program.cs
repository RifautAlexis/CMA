using CMA.Core;
using Npgsql;
using Wolverine;
using Wolverine.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var basePath = AppContext.BaseDirectory;
var environmentName = builder.Environment.EnvironmentName;

builder.Configuration
    .AddJsonFile(Path.Combine(basePath, "appsettings.Shared.json"), optional: false, reloadOnChange: true)
    .AddJsonFile(Path.Combine(basePath, $"appsettings.{environmentName}.Shared.json"), optional: true, reloadOnChange: true);

builder.Host.UseWolverine(opts => { opts.Durability.Mode = DurabilityMode.MediatorOnly; });

var connectionString = builder.Configuration.GetConnectionString("PostgresAdmin")
                       ?? throw new InvalidOperationException("Connection string 'PostgresAdmin' is missing.");

var postgresPasswordFile = builder.Configuration["POSTGRES_PASSWORD_FILE"];
if (!string.IsNullOrWhiteSpace(postgresPasswordFile))
{
    var connectionStringBuilder = new NpgsqlConnectionStringBuilder(connectionString);

    connectionStringBuilder.Host = builder.Configuration["POSTGRES_HOST"] ?? "db";
    connectionStringBuilder.Port = int.TryParse(builder.Configuration["POSTGRES_PORT"], out var port) ? port : 5432;
    connectionStringBuilder.Database = builder.Configuration["POSTGRES_DB"] ?? connectionStringBuilder.Database;
    connectionStringBuilder.Username = builder.Configuration["POSTGRES_USER"] ?? connectionStringBuilder.Username;
    connectionStringBuilder.Password = File.ReadAllText(postgresPasswordFile).Trim();

    connectionString = connectionStringBuilder.ConnectionString;
}

builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
builder.Services.AddSingleton<PostgresDeviceRepository>();
builder.Services.AddSingleton<IDeviceQueryRepository>(sp => sp.GetRequiredService<PostgresDeviceRepository>());
builder.Services.AddSingleton<IDeviceCommandRepository>(sp => sp.GetRequiredService<PostgresDeviceRepository>());

builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    }
    else
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    }
});

builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddWolverineHttp();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

// Let's add in Wolverine HTTP endpoints to the routing tree
app.MapGroup("api").MapWolverineEndpoints();

app.Run();