using CMA.Adapters.Snmp;
using CMA.Collector;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<CollectorSettings>(
    builder.Configuration.GetSection(CollectorSettings.SectionName));

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();