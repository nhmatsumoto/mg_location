using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SOSLocation.Domain.Common;

namespace SOSLocation.API.Filters
{
    public class ResultActionFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            // Do nothing before the action executes
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.Exception == null && context.Result is ObjectResult objectResult)
            {
                // Prevent wrapping an already wrapped Result<T> or Result
                var valueType = objectResult.Value?.GetType();
                if (valueType != null &&
                    (valueType == typeof(Result) ||
                    (valueType.IsGenericType && valueType.GetGenericTypeDefinition() == typeof(Result<>))))
                {
                    return;
                }

                if (objectResult.StatusCode >= 200 && objectResult.StatusCode < 300)
                {
                    // Convert success types to Result.Success(value)
                    object payload = objectResult.Value != null
                        ? Result<object>.Success(objectResult.Value)
                        : Result.Success();

                    context.Result = new ObjectResult(payload)
                    {
                        StatusCode = objectResult.StatusCode
                    };
                }
                else
                {
                    // Convert explicit error responses (e.g. BadRequest(string)) to Result.Failure
                    var errorMessage = objectResult.Value?.ToString() ?? "An error occurred";
                    context.Result = new ObjectResult(Result.Failure(errorMessage))
                    {
                        StatusCode = objectResult.StatusCode
                    };
                }
            }
        }
    }
}
