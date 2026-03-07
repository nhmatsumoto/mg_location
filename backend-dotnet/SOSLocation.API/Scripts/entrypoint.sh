#!/bin/bash
set -e

echo "Migrating Database with EF Core..."
cd SOSLocation.API
dotnet ef database update --project . --context SOSLocationDbContext --no-build

echo "Starting Application..."
dotnet SOSLocation.API.dll
