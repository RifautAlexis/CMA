namespace CMA.Core;

public class Device
{
    public required string Name { get; init; }
    public required string IpAddress { get; init; }

    public override bool Equals(object? obj)
    {
        return obj is Device other &&
               StringComparer.OrdinalIgnoreCase.Equals(IpAddress.Trim(), other.IpAddress.Trim());
    }

    public override int GetHashCode()
    {
        return StringComparer.OrdinalIgnoreCase.GetHashCode(IpAddress.Trim());
    }
}