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

        public async Task<IEnumerable<Geolocation>> GetAllAsync()
        {
            var query = "SELECT * FROM \"Geolocations\"";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<Geolocation>(query);
        }

        public IQueryable<Geolocation> GetQueryable()
        {
            return _efContext.Geolocations.AsQueryable();
        }

        public async Task AddAsync(Geolocation geolocation)
        {
            _efContext.Geolocations.Add(geolocation);
            await _efContext.SaveChangesAsync();
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

        public async Task<IEnumerable<VisitedLocation>> GetAllAsync()
        {
            var query = "SELECT * FROM \"VisitedLocations\"";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<VisitedLocation>(query);
        }

        public async Task AddAsync(VisitedLocation location)
        {
            _efContext.VisitedLocations.Add(location);
            await _efContext.SaveChangesAsync();
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

        public async Task<IEnumerable<FoundPeople>> GetAllAsync()
        {
            var query = "SELECT * FROM \"FoundPeople\"";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<FoundPeople>(query);
        }

        public async Task AddAsync(FoundPeople person)
        {
            _efContext.FoundPeople.Add(person);
            await _efContext.SaveChangesAsync();
        }
    }
}
