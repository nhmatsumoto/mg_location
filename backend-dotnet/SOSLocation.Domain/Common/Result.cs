using System;
using System.Collections.Generic;

namespace SOSLocation.Domain.Common
{
    public class Result<T>
    {
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        public T? Data { get; }
        public string? Error { get; }
        public string? Message { get; }
        public int StatusCode { get; }

        protected Result(bool isSuccess, T? data, string? error, string? message, int statusCode)
        {
            IsSuccess = isSuccess;
            Data = data;
            Error = error;
            Message = message;
            StatusCode = statusCode;
        }

        public static Result<T> Success(T data, string? message = null, int statusCode = 200) 
            => new Result<T>(true, data, null, message, statusCode);

        public static Result<T> Failure(string error, string? message = null, int statusCode = 400) 
            => new Result<T>(false, default, error, message, statusCode);
    }

    public class Result : Result<object>
    {
        protected Result(bool isSuccess, string? error, string? message, int statusCode) 
            : base(isSuccess, null, error, message, statusCode) { }

        public static Result Success(string? message = null, int statusCode = 200) 
            => new Result(true, null, message, statusCode);

        public static new Result Failure(string error, string? message = null, int statusCode = 400) 
            => new Result(false, error, message, statusCode);
    }
}
