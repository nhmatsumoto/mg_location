using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SOSLocation.Domain.Common;
using System;
using System.Net;

namespace SOSLocation.API.Filters
{
    public class ResultActionFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var executedContext = await next();

            if (executedContext.Exception != null)
            {
                return;
            }

            if (executedContext.Result is ObjectResult objectResult)
            {
                // Prevent double wrapping
                if (objectResult.Value != null)
                {
                    var valueType = objectResult.Value.GetType();
                    
                    // Check if it's already a Result or Result<T>
                    bool isAlreadyResult = valueType == typeof(Result) || 
                                         (valueType.IsGenericType && valueType.GetGenericTypeDefinition() == typeof(Result<>));

                    if (isAlreadyResult)
                    {
                        return;
                    }
                }

                int statusCode = objectResult.StatusCode ?? (int)HttpStatusCode.OK;
                bool isSuccess = statusCode >= 200 && statusCode < 300;

                object? wrappedValue;

                if (isSuccess)
                {
                    wrappedValue = Result<object>.Success(objectResult.Value!, "Operation successful", statusCode);
                }
                else
                {
                    var errorMessage = objectResult.Value?.ToString() ?? "An error occurred";
                    wrappedValue = Result.Failure(errorMessage, "Operation failed", statusCode);
                }

                executedContext.Result = new ObjectResult(wrappedValue)
                {
                    StatusCode = statusCode
                };
            }
            else if (executedContext.Result is EmptyResult)
            {
                executedContext.Result = new ObjectResult(Result.Success("Operation successful", (int)HttpStatusCode.NoContent))
                {
                    StatusCode = (int)HttpStatusCode.NoContent
                };
            }
            else if (executedContext.Result is StatusCodeResult statusCodeResult)
            {
                int statusCode = statusCodeResult.StatusCode;
                bool isSuccess = statusCode >= 200 && statusCode < 300;

                object wrappedValue = isSuccess 
                    ? Result.Success("Operation successful", statusCode)
                    : Result.Failure("An error occurred", "Operation failed", statusCode);

                executedContext.Result = new ObjectResult(wrappedValue)
                {
                    StatusCode = statusCode
                };
            }
        }
    }
}
