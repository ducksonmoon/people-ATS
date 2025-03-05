import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface for our standardized error response
 */
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  errorCode?: string;
  details?: any;
}

/**
 * Global HTTP exception filter to standardize error responses
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get status code from the exception
    const status = exception.getStatus();

    // Get the exception response
    const exceptionResponse = exception.getResponse() as any;

    // Determine if the response is already formatted
    const isFormattedResponse =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse;

    // Build the standardized error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: isFormattedResponse
        ? exceptionResponse.message
        : exception.message || 'Internal server error',
      ...(isFormattedResponse && exceptionResponse.errorCode
        ? { errorCode: exceptionResponse.errorCode }
        : {}),
      ...(isFormattedResponse && exceptionResponse.details
        ? { details: exceptionResponse.details }
        : {}),
    };

    // Log the error (but not in test environment)
    if (process.env.NODE_ENV !== 'test') {
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `${request.method} ${request.url}`,
          exception.stack,
          `Error: ${JSON.stringify(errorResponse)}`,
        );
      } else {
        this.logger.warn(
          `${request.method} ${request.url}`,
          `Warning: ${JSON.stringify(errorResponse)}`,
        );
      }
    }

    // Send the response
    response.status(status).json(errorResponse);
  }
}
