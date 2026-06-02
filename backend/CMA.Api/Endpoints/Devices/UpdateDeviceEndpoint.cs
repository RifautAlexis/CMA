using System.Net;
using System.Text.RegularExpressions;
using CMA.Core;
using Microsoft.AspNetCore.Mvc;
using Wolverine.Http;

namespace CMA.Api.Endpoints.Devices;

public class UpdateDeviceEndpoint
{
    private static readonly Regex OidRegex = new(
        @"^\.?\d{1,5}(?:\.\d{1,5})*$",
        RegexOptions.Compiled);

    public static ProblemDetails Validate(Guid id, UpdateDeviceRequest request)
    {
        if (id == Guid.Empty)
        {
            return new ProblemDetails
            {
                Status = 400,
                Title = "Invalid request",
                Detail = "Device ID cannot be empty.",
            };
        }

        if (!HasAnyUpdate(request))
        {
            return new ProblemDetails
            {
                Status = 400,
                Title = "Invalid request",
                Detail = "At least one property must be provided for update.",
            };
        }

        if (request.Name is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Name",
                    Detail = "Name is required.",
                };
            }

            if (request.Name.Length is < 3 or > 32)
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Name",
                    Detail = "Name must be between 3 and 32 characters.",
                };
            }
        }

        if (request.IpAddress is not null)
        {
            if (string.IsNullOrWhiteSpace(request.IpAddress))
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid IP address",
                    Detail = "IP address is required.",
                };
            }

            if (!IPAddress.TryParse(request.IpAddress.Trim(), out _))
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid IP address",
                    Detail = "IP address do not represent a valid IP address.",
                };
            }
        }

        if (request.SnmpSettings is null) return WolverineContinue.NoProblems;
        if (request.SnmpSettings.SnmpPort is not null && request.SnmpSettings.SnmpPort is <= 0 or > 65535)
        {
            return new ProblemDetails
            {
                Title = "Invalid SNMP Port",
                Detail = "SNMP Port must be between 1 and 65535.",
                Status = 400
            };
        }

        if (request.SnmpSettings.SnmpVersion is not null && request.SnmpSettings.SnmpVersion is < 1 or > 3)
        {
            return new ProblemDetails
            {
                Title = "Invalid SNMP Version",
                Detail = "SNMP Version must be 1, 2, or 3.",
                Status = 400
            };
        }

        if (request.SnmpSettings.SnmpVersion is not null)
        {
            if (string.IsNullOrWhiteSpace(request.SnmpSettings.Mib2Branch))
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid MIB2 Branch",
                    Detail = "MIB2 Branch is required.",
                };
            }

            if (!OidRegex.IsMatch(request.SnmpSettings.Mib2Branch.Trim()))
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid MIB2 Branch",
                    Detail = "MIB2 Branch must be a valid OID.",
                };
            }
        }

        if (request.SnmpSettings.ReadCommunity is not null)
        {
            if (string.IsNullOrWhiteSpace(request.SnmpSettings.ReadCommunity))
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Read Community",
                    Detail = "Read Community is required.",
                };
            }

            if (request.SnmpSettings.ReadCommunity.Length is < 1 or > 64)
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Read Community",
                    Detail = "Read Community must be between 1 and 64 characters.",
                };
            }
        }

        if (request.SnmpSettings.WriteCommunity is not null)
        {
            if (string.IsNullOrWhiteSpace(request.SnmpSettings.WriteCommunity))
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Write Community",
                    Detail = "Write Community is required.",
                };
            }

            if (request.SnmpSettings.WriteCommunity.Length is < 1 or > 64)
            {
                return new ProblemDetails
                {
                    Status = 400,
                    Title = "Invalid Write Community",
                    Detail = "Write Community must be between 1 and 64 characters.",
                };
            }
        }

        return WolverineContinue.NoProblems;
    }

    public static async Task<ProblemDetails> ValidateAsync(Guid id, UpdateDeviceRequest request,
        IDeviceQueryRepository repository)
    {
        if (request.IpAddress is null) return WolverineContinue.NoProblems;

        var isIpUnique = await repository.IsIpUniqueAsync(request.IpAddress, id, CancellationToken.None);
        if (isIpUnique) return WolverineContinue.NoProblems;

        return new ProblemDetails
        {
            Status = 400,
            Title = "Invalid IP address",
            Detail = "IP address already exists.",
        };
    }

    [WolverinePatch("/devices/{id}")]
    public static async Task<IResult> UpdateDevice(Guid id, UpdateDeviceRequest request, IDeviceCommandRepository repository)
    {
        var updatedDevice = await repository.UpdateAsync(
            id,
            new UpdateDeviceInput
            {
                Name = request.Name,
                IpAddress = request.IpAddress,
                SnmpSettings = request.SnmpSettings is not null && HasAnySnmpUpdate(request.SnmpSettings)
                    ? new UpdateSnmpSettingsInput
                    {
                        SnmpPort = request.SnmpSettings.SnmpPort,
                        SnmpVersion = request.SnmpSettings.SnmpVersion,
                        Mib2Branch = request.SnmpSettings.Mib2Branch,
                        ReadCommunity = request.SnmpSettings.ReadCommunity,
                        WriteCommunity = request.SnmpSettings.WriteCommunity,
                    }
                    : null,
            },
            CancellationToken.None);

        return updatedDevice is null ? Results.NotFound() : Results.Ok(UpdateDeviceResponse.FromDevice(updatedDevice));
    }

    private static bool HasAnyUpdate(UpdateDeviceRequest request) =>
        request.Name is not null ||
        request.IpAddress is not null ||
        (request.SnmpSettings is not null && HasAnySnmpUpdate(request.SnmpSettings));

    private static bool HasAnySnmpUpdate(UpdateSnmpSettingsRequest request) =>
        request.SnmpPort is not null ||
        request.SnmpVersion is not null ||
        request.Mib2Branch is not null ||
        request.ReadCommunity is not null ||
        request.WriteCommunity is not null;
}

public abstract class UpdateDeviceRequest
{
    public string? Name { get; init; }
    public string? IpAddress { get; init; }
    public UpdateSnmpSettingsRequest? SnmpSettings { get; init; }
}

public abstract class UpdateSnmpSettingsRequest
{
    public int? SnmpPort { get; init; }
    public int? SnmpVersion { get; init; }
    public string? Mib2Branch { get; init; }
    public string? ReadCommunity { get; init; }
    public string? WriteCommunity { get; init; }
}

public class UpdateDeviceResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public static UpdateDeviceResponse FromDevice(Device device)
    {
        return new UpdateDeviceResponse
        {
            Id = device.Id,
            Name = device.Name,
            IpAddress = device.IpAddress,
            CreatedAt = device.CreatedAt,
            UpdatedAt = device.UpdatedAt,
        };
    }
}