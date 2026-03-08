export class ApplicationError extends Error {
  public readonly errorType: string;

  constructor(errorType: string, message: string) {
    super(message);
    this.name = 'ApplicationError';
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }
}