using Dapper;
using SOSLocation.Domain.Missions;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Infrastructure.Persistence.Dapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace SOSLocation.Infrastructure.Persistence.Repositories
{
    public class GeolocationRepository : IGeolocationRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly SOSLocationDbContext _efContext;

        public GeolocationRepository(DapperContext dapperContext, SOSLocationDbContext efContext)
        {
            _dapperContext = dapperContext;
            _efContext = efContext;
        }

        public async Task<IEnumerable<Geolocation>> GetAllAsync(CancellationToken ct = default)
        {
            var query = "SELECT * FROM \"Geolocations\"";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<Geolocation>(new CommandDefinition(query, cancellationToken: ct));
        }

        public IQueryable<Geolocation> GetQueryable()
        {
            return _efContext.Geolocations.AsQueryable();
        }

        public async Task AddAsync(Geolocation geolocation, CancellationToken ct = default)
        {
            _efContext.Geolocations.Add(geolocation);
            await _efContext.SaveChangesAsync(ct);
        }
    }

    public class VisitedLocationRepository : IVisitedLocationRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly SOSLocationDbContext _efContext;

        public VisitedLocationRepository(DapperContext dapperContext, SOSLocationDbContext efContext)
        {
            _dapperContext = dapperContext;
            _efContext = efContext;
        }

        public async Task<IEnumerable<VisitedLocation>> GetAllAsync(CancellationToken ct = default)
        {
            var query = "SELECT * FROM \"VisitedLocations\"";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<VisitedLocation>(new CommandDefinition(query, cancellationToken: ct));
        }

        public async Task AddAsync(VisitedLocation location, CancellationToken ct = default)
        {
            _efContext.VisitedLocations.Add(location);
            await _efContext.SaveChangesAsync(ct);
        }
    }

    public class FoundPeopleRepository : IFoundPeopleRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly SOSLocationDbContext _efContext;

        public FoundPeopleRepository(DapperContext dapperContext, SOSLocationDbContext efContext)
        {
            _dapperContext = dapperContext;
            _efContext = efContext;
        }

        public async Task<IEnumerable<FoundPeople>> GetAllAsync(CancellationToken ct = default)
        {
            var query = "SELECT * FROM \"FoundPeople\"";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<FoundPeople>(new CommandDefinition(query, cancellationToken: ct));
        }

        public async Task AddAsync(FoundPeople person, CancellationToken ct = default)
        {
            _efContext.FoundPeople.Add(person);
            await _efContext.SaveChangesAsync(ct);
        }
    }
}
