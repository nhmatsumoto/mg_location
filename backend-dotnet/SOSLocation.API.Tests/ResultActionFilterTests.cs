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
        public void OnActionExecuted_WrapsObjectResultInResultSuccess()
        {
            // Arrange
            var filter = new ResultActionFilter();
            var actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor()
            );
            var context = new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), new object())
            {
                Result = new ObjectResult("test-value") { StatusCode = 200 }
            };

            // Act
            filter.OnActionExecuted(context);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(context.Result);
            var result = Assert.IsType<Result<object>>(objectResult.Value);
            Assert.True(result.IsSuccess);
            Assert.Equal("test-value", result.Value);
        }

        [Fact]
        public void OnActionExecuted_DoesNotDoubleWrapResult()
        {
            // Arrange
            var filter = new ResultActionFilter();
            var actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor()
            );
            var alreadyWrapped = Result<object>.Success("already");
            var context = new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), new object())
            {
                Result = new ObjectResult(alreadyWrapped) { StatusCode = 200 }
            };

            // Act
            filter.OnActionExecuted(context);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(context.Result);
            Assert.Same(alreadyWrapped, objectResult.Value);
        }

        [Fact]
        public void OnActionExecuted_ConvertsErrorStatusCodeToResultFailure()
        {
            // Arrange
            var filter = new ResultActionFilter();
            var actionContext = new ActionContext(
                new DefaultHttpContext(),
                new RouteData(),
                new ActionDescriptor()
            );
            var context = new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), new object())
            {
                Result = new ObjectResult("error-msg") { StatusCode = 400 }
            };

            // Act
            filter.OnActionExecuted(context);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(context.Result);
            var result = Assert.IsType<Result>(objectResult.Value);
            Assert.True(result.IsFailure);
            Assert.Equal("error-msg", result.Error);
        }
    }
}
