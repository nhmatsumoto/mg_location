using Dapper;
using SOSLocation.Domain.Tracking;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Infrastructure.Persistence.Dapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace SOSLocation.Infrastructure.Persistence.Repositories
{
    public class HubRepository : IHubRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly SOSLocationDbContext _efContext;

        public HubRepository(DapperContext dapperContext, SOSLocationDbContext efContext)
        {
            _dapperContext = dapperContext;
            _efContext = efContext;
        }

        public async Task<IEnumerable<EdgeHub>> GetAllAsync()
        {
            var query = "SELECT * FROM \"Hubs\"";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<EdgeHub>(query);
        }

        public async Task AddAsync(EdgeHub hub)
        {
            _efContext.Hubs.Add(hub);
            await _efContext.SaveChangesAsync();
        }
    }
}
