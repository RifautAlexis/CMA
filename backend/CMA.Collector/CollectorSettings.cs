namespace CMA.Collector;

public class CollectorSettings
{
    public const string SectionName = "CollectorSettings";

    public int PollingIntervalSeconds { get; init; } = 60;
    public int TimeoutSeconds { get; init; } = 10;
}

