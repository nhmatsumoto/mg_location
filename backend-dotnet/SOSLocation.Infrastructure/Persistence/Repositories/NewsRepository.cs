using Microsoft.EntityFrameworkCore;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Domain.News;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SOSLocation.Infrastructure.Persistence.Repositories
{
    public class NewsRepository : INewsRepository
    {
        private readonly SOSLocationDbContext _context;

        public NewsRepository(SOSLocationDbContext context)
        {
            _context = context;
        }

        public async Task<NewsNotification?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.NewsNotifications.FindAsync(new object[] { id }, ct);
        }

        public async Task<IEnumerable<NewsNotification>> GetAllAsync(string? country = null, string? location = null, string? timeWindow = null, CancellationToken ct = default)
        {
            IQueryable<NewsNotification> query = _context.NewsNotifications;

            if (!string.IsNullOrEmpty(country))
            {
                query = query.Where(n => n.Country.ToLower() == country.ToLower());
            }

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(n => n.Location.ToLower().Contains(location.ToLower()));
            }

            if (!string.IsNullOrEmpty(timeWindow))
            {
                var now = DateTime.UtcNow;
                query = timeWindow.ToLower() switch
                {
                    "live" => query.Where(n => n.PublishedAt >= now.AddHours(-24)),
                    "week" => query.Where(n => n.PublishedAt >= now.AddDays(-7)),
                    "month" => query.Where(n => n.PublishedAt >= now.AddDays(-30)),
                    "year" => query.Where(n => n.PublishedAt >= now.AddDays(-365)),
                    _ => query
                };
            }

            return await query.OrderByDescending(n => n.PublishedAt).ToListAsync(ct);
        }

        public async Task<bool> ExistsAsync(string title, DateTime publishedAt, CancellationToken ct = default)
        {
            return await _context.NewsNotifications.AnyAsync(n => n.Title == title && n.PublishedAt == publishedAt, ct);
        }

        public async Task AddAsync(NewsNotification news, CancellationToken ct = default)
        {
            await _context.NewsNotifications.AddAsync(news, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteOldNewsAsync(DateTime olderThan, CancellationToken ct = default)
        {
            var oldNews = _context.NewsNotifications.Where(n => n.PublishedAt < olderThan);
            _context.NewsNotifications.RemoveRange(oldNews);
            await _context.SaveChangesAsync(ct);
        }
    }
}
