using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using SOSLocation.Domain.News;

namespace SOSLocation.Domain.Interfaces
{
    public interface INewsRepository
    {
        Task<NewsNotification?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<IEnumerable<NewsNotification>> GetAllAsync(string? country = null, string? location = null, string? timeWindow = null, CancellationToken ct = default);
        Task<bool> ExistsAsync(string title, DateTime publishedAt, CancellationToken ct = default);
        Task AddAsync(NewsNotification news, CancellationToken ct = default);
        Task DeleteOldNewsAsync(DateTime olderThan, CancellationToken ct = default);
    }
}
