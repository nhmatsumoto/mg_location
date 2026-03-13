using Microsoft.EntityFrameworkCore;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Persistence.Repositories
{
    public class DataSourceRepository : IDataSourceRepository
    {
        private readonly SOSLocationDbContext _context;

        public DataSourceRepository(SOSLocationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DataSource>> GetAllActiveAsync(CancellationToken ct = default)
        {
            return await _context.DataSources
                .Where(d => d.IsActive)
                .ToListAsync(ct);
        }

        public async Task<DataSource?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.DataSources.FindAsync(new object[] { id }, ct);
        }

        public async Task AddAsync(DataSource dataSource, CancellationToken ct = default)
        {
            await _context.DataSources.AddAsync(dataSource, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(DataSource dataSource, CancellationToken ct = default)
        {
            _context.DataSources.Update(dataSource);
            await _context.SaveChangesAsync(ct);
        }
    }
}
