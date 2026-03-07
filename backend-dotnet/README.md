# SOS Location - .NET Backend

This is the enterprise-grade .NET backend for the SOS Location project, migrated from Python/Django.

## Architecture

The project follows **Clean Architecture**, **Domain-Driven Design (DDD)**, and **SOLID** principles.

- **SOSLocation.Domain**: Core business logic, entities, value objects, and repository interfaces.
- **SOSLocation.Application**: Use cases (MediatR), DTOs, FluentValidation, and application logic.
- **SOSLocation.Infrastructure**: Data access (EF Core + Dapper), PostgreSQL implementation, and external services.
- **SOSLocation.API**: ASP.NET Core Web API, controllers, and middleware.

## Tech Stack

- **.NET 10** (C#)
- **PostgreSQL** with EF Core (Commands) and Dapper (Queries)
- **MediatR** for CQRS
- **FluentValidation** for request validation
- **Serilog** for structured logging
- **Keycloak** for authentication (JWT)

## Development

1. Ensure you have the .NET 10 SDK installed.
2. Update `appsettings.json` with your database and Keycloak credentials.
3. Run `dotnet build SOSLocation.sln` to build.
4. Run `dotnet run --project SOSLocation.API/SOSLocation.API.csproj` to start the API.
