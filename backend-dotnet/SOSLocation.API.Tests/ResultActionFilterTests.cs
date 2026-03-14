using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using SOSLocation.API.Filters;
using SOSLocation.Domain.Common;
using Xunit;

namespace SOSLocation.API.Tests
{
    public class ResultActionFilterTests
    {
        [Fact]
        public async Task OnActionExecutionAsync_WrapsObjectResultInResultSuccess()
        {
            // Arrange
            var filter = new ResultActionFilter();
            var actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor()
            );
            
            var executingContext = new ActionExecutingContext(
                actionContext,
                new List<IFilterMetadata>(),
                new Dictionary<string, object?>(),
                new object()
            );

            var executedContext = new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), new object())
            {
                Result = new ObjectResult("test-value") { StatusCode = 200 }
            };

            ActionExecutionDelegate next = () => Task.FromResult(executedContext);

            // Act
            await filter.OnActionExecutionAsync(executingContext, next);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(executedContext.Result);
            var result = Assert.IsType<Result<object>>(objectResult.Value);
            Assert.True(result.IsSuccess);
            Assert.Equal("test-value", result.Data);
        }

        [Fact]
        public async Task OnActionExecutionAsync_DoesNotDoubleWrapResult()
        {
            // Arrange
            var filter = new ResultActionFilter();
            var actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor()
            );
            
            var alreadyWrapped = Result<object>.Success("already");
            var executingContext = new ActionExecutingContext(
                actionContext,
                new List<IFilterMetadata>(),
                new Dictionary<string, object?>(),
                new object()
            );

            var executedContext = new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), new object())
            {
                Result = new ObjectResult(alreadyWrapped) { StatusCode = 200 }
            };

            ActionExecutionDelegate next = () => Task.FromResult(executedContext);

            // Act
            await filter.OnActionExecutionAsync(executingContext, next);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(executedContext.Result);
            Assert.Same(alreadyWrapped, objectResult.Value);
        }

        [Fact]
        public async Task OnActionExecutionAsync_ConvertsErrorStatusCodeToResultFailure()
        {
            // Arrange
            var filter = new ResultActionFilter();
            var actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor()
            );
            
            var executingContext = new ActionExecutingContext(
                actionContext,
                new List<IFilterMetadata>(),
                new Dictionary<string, object?>(),
                new object()
            );

            var executedContext = new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), new object())
            {
                Result = new ObjectResult("error-msg") { StatusCode = 400 }
            };

            ActionExecutionDelegate next = () => Task.FromResult(executedContext);

            // Act
            await filter.OnActionExecutionAsync(executingContext, next);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(executedContext.Result);
            var result = Assert.IsType<Result>(objectResult.Value);
            Assert.True(result.IsFailure);
            Assert.Equal("error-msg", result.Error);
        }
    }
}
