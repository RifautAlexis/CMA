using System.Net;
using CMA.Core;
using Microsoft.AspNetCore.Mvc;
using Wolverine.Http;

namespace CMA.Api.Endpoints.Devices;

public class ValidateDeviceIpUniquenessEndpoint
{
    public static ProblemDetails Validate(ValidateDeviceIpUniquenessRequest request)
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
                Detail = "IP address does not represent a valid IP address.",
            };
        }

        return WolverineContinue.NoProblems;
    }

    [WolverineGet("/devices/ip-address/unique")]
    public static async Task<bool> ValidateDeviceIpUniqueness(
        [AsParameters] ValidateDeviceIpUniquenessRequest request,
        IDeviceQueryRepository repository)
    {
        return await repository.IsIpUniqueAsync(request.IpAddress, request.ExcludedDeviceId, CancellationToken.None);
    }
}

public sealed class ValidateDeviceIpUniquenessRequest
{
    [FromQuery(Name = "ipAddress")]
    public string IpAddress { get; set; } = string.Empty;

    [FromQuery(Name = "excludedDeviceId")]
    public Guid? ExcludedDeviceId { get; set; }
}

