using Microsoft.EntityFrameworkCore;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Persistence.Repositories
{
    public class GamificationRepository : IGamificationRepository
    {
        private readonly SOSLocationDbContext _context;

        public GamificationRepository(SOSLocationDbContext context)
        {
            _context = context;
        }

        public async Task<UserStats?> GetStatsByUserIdAsync(string keycloakUserId, CancellationToken ct = default)
        {
            return await _context.UserStats
                .FirstOrDefaultAsync(s => s.KeycloakUserId == keycloakUserId, ct);
        }

        public async Task UpdateStatsAsync(UserStats stats, CancellationToken ct = default)
        {
            if (_context.Entry(stats).State == EntityState.Detached)
            {
                _context.UserStats.Update(stats);
            }
            await _context.SaveChangesAsync(ct);
        }

        public async Task<IEnumerable<Badge>> GetAllBadgesAsync(CancellationToken ct = default)
        {
            return await _context.Badges.AsNoTracking().ToListAsync(ct);
        }

        public async Task<IEnumerable<UserBadge>> GetUserBadgesAsync(string keycloakUserId, CancellationToken ct = default)
        {
            return await _context.UserBadges
                .Include(ub => ub.Badge)
                .Where(ub => ub.KeycloakUserId == keycloakUserId)
                .AsNoTracking()
                .ToListAsync(ct);
        }

        public async Task AddUserBadgeAsync(UserBadge userBadge, CancellationToken ct = default)
        {
            _context.UserBadges.Add(userBadge);
            await _context.SaveChangesAsync(ct);
        }
    }
}
