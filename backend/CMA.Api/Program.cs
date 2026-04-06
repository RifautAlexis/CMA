using CMA.Api.Database;
using Npgsql;
using Wolverine;
using Wolverine.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Host.UseWolverine(opts =>
{
    opts.Durability.Mode = DurabilityMode.MediatorOnly;
});

var connectionString = builder.Configuration.GetConnectionString("PostgreAdmin")
    ?? throw new InvalidOperationException("Connection string 'PostgreAdmin' is missing.");

DatabaseMigrator.Run(connectionString);

builder.Services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddWolverineHttp();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Let's add in Wolverine HTTP endpoints to the routing tree
app.MapWolverineEndpoints();

app.Run();