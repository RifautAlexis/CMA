namespace CMA.Core;

public class Device
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string IpAddress { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

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