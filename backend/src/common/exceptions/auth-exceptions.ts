import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Custom exception for invalid credentials
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message: string = 'Invalid email or password') {
    super({
      message,
      errorCode: 'AUTH_INVALID_CREDENTIALS',
      statusCode: 401,
    });
  }
}

/**
 * Custom exception for expired tokens
 */
export class TokenExpiredException extends UnauthorizedException {
  constructor(
    message: string = 'Your session has expired. Please log in again',
  ) {
    super({
      message,
      errorCode: 'AUTH_TOKEN_EXPIRED',
      statusCode: 401,
    });
  }
}

/**
 * Custom exception for invalid tokens
 */
export class InvalidTokenException extends UnauthorizedException {
  constructor(message: string = 'Invalid authentication token') {
    super({
      message,
      errorCode: 'AUTH_INVALID_TOKEN',
      statusCode: 401,
    });
  }
}

/**
 * Custom exception for insufficient permissions
 */
export class InsufficientPermissionsException extends ForbiddenException {
  constructor(
    message: string = 'You do not have sufficient permissions to access this resource',
  ) {
    super({
      message,
      errorCode: 'AUTH_INSUFFICIENT_PERMISSIONS',
      statusCode: 403,
    });
  }
}

/**
 * Custom exception for user not found
 */
export class UserNotFoundException extends BadRequestException {
  constructor(message: string = 'User not found') {
    super({
      message,
      errorCode: 'AUTH_USER_NOT_FOUND',
      statusCode: 400,
    });
  }
}

/**
 * Custom exception for account not activated
 */
export class AccountNotActivatedException extends UnauthorizedException {
  constructor(
    message: string = 'Account not activated. Please check your email',
  ) {
    super({
      message,
      errorCode: 'AUTH_ACCOUNT_NOT_ACTIVATED',
      statusCode: 401,
    });
  }
}

/**
 * Custom exception for email already in use
 */
export class EmailAlreadyInUseException extends BadRequestException {
  constructor(message: string = 'Email address is already in use') {
    super({
      message,
      errorCode: 'AUTH_EMAIL_IN_USE',
      statusCode: 400,
    });
  }
}
