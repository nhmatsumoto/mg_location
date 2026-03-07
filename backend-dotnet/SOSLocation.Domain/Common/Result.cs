namespace SOSLocation.Domain.Common
{
    public class Result<T>
    {
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        public T? Value { get; }
        public string? Error { get; }

        protected Result(bool isSuccess, T? value, string? error)
        {
            IsSuccess = isSuccess;
            Value = value;
            Error = error;
        }

        public static Result<T> Success(T value) => new Result<T>(true, value, null);
        public static Result<T> Failure(string error) => new Result<T>(false, default, error);
    }

    public class Result : Result<object>
    {
        protected Result(bool isSuccess, string? error) : base(isSuccess, null, error) { }

        public static Result Success() => new Result(true, null);
        public static new Result Failure(string error) => new Result(false, error);
    }
}
