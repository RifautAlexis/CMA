using System.Net;
using System.Text.RegularExpressions;
using CMA.Core;
using Wolverine.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMA.Api.Endpoints.Devices;

public class CreateDeviceEndpoint
{
    private static readonly Regex OidRegex = new(
        @"^\.?\d{1,5}(?:\.\d{1,5})*$",
        RegexOptions.Compiled);

    public static ProblemDetails Validate(CreateDeviceRequest request)
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

        if (request.SnmpSettings is null) return WolverineContinue.NoProblems;
        if (request.SnmpSettings.SnmpPort is <= 0 or > 65535)
        {
            return new ProblemDetails
            {
                Title = "Invalid SNMP Port",
                Detail = "SNMP Port must be between 1 and 65535.",
                Status = 400
            };
        }

        if (request.SnmpSettings.SnmpVersion is < 1 or > 3)
        {
            return new ProblemDetails
            {
                Title = "Invalid SNMP Version",
                Detail = "SNMP Version must be 1, 2, or 3.",
                Status = 400
            };
        }

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

        return WolverineContinue.NoProblems;
    }

    public static async Task<ProblemDetails> ValidateAsync(CreateDeviceRequest request,
        IDeviceQueryRepository repository)
    {
        var isIpUnique = await repository.IsIpUniqueAsync(request.IpAddress, null, CancellationToken.None);
        if (!isIpUnique)
        {
            return new ProblemDetails
            {
                Status = 400,
                Title = "Invalid IP address",
                Detail = "IP address already exists.",
            };
        }

        return WolverineContinue.NoProblems;
    }

    [WolverinePost("/devices")]
    public static async Task<CreateDeviceResponse> CreateDevice(CreateDeviceRequest request,
        IDeviceCommandRepository repository)
    {
        var device = await repository.CreateAsync(
            new CreateDeviceInput
            {
                Name = request.Name,
                IpAddress = request.IpAddress,
                SnmpSettings = request.SnmpSettings is not null
                    ? new SnmpSettingsInput
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

        return CreateDeviceResponse.FromDevice(device);
    }
}

public abstract class CreateDeviceRequest
{
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public CreateSnmpSettingsRequest? SnmpSettings { get; init; }
}

public abstract class CreateSnmpSettingsRequest
{
    public required int SnmpPort { get; init; }
    public required int SnmpVersion { get; init; }
    public required string Mib2Branch { get; init; }
    public required string ReadCommunity { get; init; }
    public required string WriteCommunity { get; init; }
}

public class CreateDeviceResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public static CreateDeviceResponse FromDevice(Device device)
    {
        return new CreateDeviceResponse
        {
            Id = device.Id,
            Name = device.Name,
            IpAddress = device.IpAddress,
            CreatedAt = device.CreatedAt,
            UpdatedAt = device.UpdatedAt,
        };
    }
}