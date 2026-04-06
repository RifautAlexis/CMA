using DbUp;
using System.Reflection;

namespace CMA.Api.Database;

public static class DatabaseMigrator
{
    public static void Run(string connectionString)
    {
        var upgrader = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(
                Assembly.GetExecutingAssembly(),
                script => script.Contains("Database.Scripts"))
            .WithTransactionPerScript()
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
            throw new InvalidOperationException(
                $"Database migration failed: {result.Error.Message}", result.Error);
    }
}

