export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'BAD_REQUEST'
  | 'PAYMENT_REQUIRED'
  | 'METHOD_NOT_ALLOWED'
  | 'NOT_ACCEPTABLE'
  | 'REQUEST_TIMEOUT'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'UNPROCESSABLE_ENTITY'
  | 'TOO_MANY_REQUESTS'
  | string;

export interface IValidationError {
  field?: string;
  message: string;
  code?: string;
}

class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly code: ErrorCode;
  public readonly errors?: IValidationError[];
  public readonly details?: any;

  constructor(
    message: string, 
    statusCode: number = 500, 
    code: ErrorCode = 'INTERNAL_SERVER_ERROR',
    errors?: IValidationError[],
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    this.errors = errors;
    this.details = details;
    
    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
    
    // Capture stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Factory methods for common error types
  static badRequest(message: string, code: ErrorCode = 'BAD_REQUEST', errors?: IValidationError[]) {
    return new AppError(message, 400, code, errors);
  }
  
  static unauthorized(message: string = 'Unauthorized', code: ErrorCode = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }
  
  static forbidden(message: string = 'Forbidden', code: ErrorCode = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }
  
  static notFound(message: string = 'Resource not found', code: ErrorCode = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }
  
  static conflict(message: string, code: ErrorCode = 'CONFLICT') {
    return new AppError(message, 409, code);
  }
  
  static validationError(message: string = 'Validation failed', errors: IValidationError[] = []) {
    return new AppError(message, 422, 'VALIDATION_ERROR', errors);
  }
  
  static tooManyRequests(message: string = 'Too many requests, please try again later') {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS');
  }
  
  static internal(message: string = 'An unexpected error occurred', details?: any) {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR', undefined, details);
  }
  
  // Helper to convert validation errors from express-validator
  static fromValidationErrors(validationErrors: Array<{ msg: string; param?: string; location?: string }>) {
    const errors: IValidationError[] = validationErrors.map(err => ({
      field: err.param,
      message: err.msg,
      code: 'VALIDATION_ERROR'
    }));
    
    return AppError.validationError('Validation failed', errors);
  }
  
  // Convert error to JSON for API responses
  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

export default AppError;
