using CMA.Core;
using Lextm.SharpSnmpLib;
using Lextm.SharpSnmpLib.Messaging;
using System.Net;

namespace CMA.Adapters.Snmp;

public sealed class SnmpAdapter : IDeviceAdapter
{
    public bool CanPoll(Device device) => device.Snmp is not null;

    public Task<AdapterPollResult> PollAsync(Device device, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(device);
        var settings = device.Snmp;

        if (settings is null)
        {
            return Task.FromResult(AdapterPollResult.Failed(device.Id, "SNMP settings are missing."));
        }

        if (!IPAddress.TryParse(device.IpAddress.Trim(), out var ipAddress))
        {
            return Task.FromResult(AdapterPollResult.Failed(device.Id, "Invalid IP address."));
        }

        try
        {
            var endpoint = new IPEndPoint(ipAddress, settings.Port);
            var variables = new List<Variable>();
            var community = new OctetString(string.IsNullOrWhiteSpace(settings.Community) ? "public" : settings.Community);
            var rootOid = new ObjectIdentifier(string.IsNullOrWhiteSpace(settings.WalkOid) ? "1.3.6.1.2.1" : settings.WalkOid);
            var version = ParseVersion(settings.Version);

            Messenger.Walk(
                version,
                endpoint,
                community,
                rootOid,
                variables,
                timeout: 5000,
                mode: WalkMode.WithinSubtree);

            return Task.FromResult(AdapterPollResult.Succeeded(device.Id, $"SNMP walk succeeded ({variables.Count} OIDs)."));
        }
        catch (Exception ex)
        {
            return Task.FromResult(AdapterPollResult.Failed(device.Id, $"SNMP walk failed: {ex.Message}"));
        }
    }

    private static VersionCode ParseVersion(string? version)
    {
        return version?.Trim().ToLowerInvariant() switch
        {
            "v1" => VersionCode.V1,
            "v3" => VersionCode.V3,
            _ => VersionCode.V2,
        };
    }
}