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
                // Prevent wrapping an already wrapped Result<T>
                if (objectResult.Value?.GetType().IsGenericType == true &&
                    objectResult.Value.GetType().GetGenericTypeDefinition() == typeof(Result<>))
                {
                    return;
                }

                if (objectResult.StatusCode >= 200 && objectResult.StatusCode < 300)
                {
                    // Convert success types to Result.Success(value)
                    context.Result = new ObjectResult(Result<object>.Success(objectResult.Value))
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
