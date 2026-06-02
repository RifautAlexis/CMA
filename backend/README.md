# CMA Backend

This solution now supports protocol-driven polling from `CMA.Collector` using adapters and a shared PostgreSQL-backed device repository.

## What is implemented

- `CMA.Api` exposes CRUD endpoints for devices (including protocol and SNMP settings).
- `CMA.Collector` loads devices from PostgreSQL at startup and synchronizes from DB every cycle.
- Collector uses `IDeviceAdapter` implementations, currently `SnmpAdapter` (`snmp` protocol).
- `PostgresDeviceRepository` auto-creates/updates the `device` table schema.

## Device model fields

- `name`
- `ipAddress`
- `protocol` (currently: `snmp`)
- `snmp.community` (optional)
- `snmp.port` (optional, default 161 at runtime)
- `snmp.version` (optional, defaults to v2)
- `snmp.walkOid` (optional, defaults to `1.3.6.1.2.1`)

## Run

```powershell
dotnet restore .\CMA.sln
dotnet build .\CMA.sln
dotnet run --project .\CMA.Api\CMA.Api.csproj
dotnet run --project .\CMA.Collector\CMA.Collector.csproj
```

## Quick API example

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5098/api/devices" -ContentType "application/json" -Body '{"name":"Router-1","ipAddress":"127.0.0.1","protocol":"snmp","snmp":{"community":"public","port":161,"version":"v2","walkOid":"1.3.6.1.2.1"}}'
Invoke-RestMethod -Method Get -Uri "http://localhost:5098/api/devices"
```


