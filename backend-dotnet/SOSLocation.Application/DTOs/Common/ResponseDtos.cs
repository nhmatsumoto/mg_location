using System.Collections.Generic;

namespace SOSLocation.Application.DTOs.Common
{
    public class ListResponseDto<T>
    {
        public IEnumerable<T> Items { get; set; } = [];
        public int TotalCount { get; set; }
    }

    public class ActionResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
