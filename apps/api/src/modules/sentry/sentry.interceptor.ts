/**
 * Sentry Interceptor
 * Automatically captures exceptions from HTTP requests
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query, user } = request;

    // Start transaction for performance monitoring
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: `${method} ${url}`,
    });

    // Set transaction on scope
    Sentry.configureScope((scope) => {
      scope.setSpan(transaction);
    });

    // Set user context if available
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.displayName,
      });
    }

    // Add request context
    Sentry.setContext('request', {
      method,
      url,
      params,
      query,
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap(() => {
        // Finish transaction on success
        transaction.setHttpStatus(200);
        transaction.finish();
      }),
      catchError((error) => {
        // Capture exception
        Sentry.withScope((scope) => {
          scope.setExtra('request', {
            method,
            url,
            params,
            query,
          });

          if (error instanceof HttpException) {
            const status = error.getStatus();
            transaction.setHttpStatus(status);

            // Only capture 5xx errors as exceptions
            if (status >= 500) {
              Sentry.captureException(error);
            }
          } else {
            // Capture all non-HTTP exceptions
            Sentry.captureException(error);
          }
        });

        transaction.finish();
        return throwError(() => error);
      }),
    );
  }

  /**
   * Remove sensitive data from request body
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
