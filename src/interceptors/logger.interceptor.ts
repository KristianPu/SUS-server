import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonLogger } from 'nest-winston';
import { catchError, tap, throwError } from 'rxjs';
import { Request, Response } from 'express';

import { LoggedUser } from '../types/logged-user.type';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private prodLogLevels = ['error', 'warn'];
  private bodyMethods = ['POST', 'PUT', 'PATCH'];
  constructor(
    @Inject('LOGGER')
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    (logger as WinstonLogger).setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const now = Date.now();
    const { method, originalUrl, body, cookies, headers } = request;
    const { statusCode } = response;

    let message = '',
      userIdLog = 'requester-id';

    // Avoid logs for k8s probes
    if (/\/health\/(ready|live)$/.test(originalUrl)) return next.handle();

    // Set logId from cookie
    if (cookies?.logId) message = `${cookies.logId}`;

    try {
      const token = headers['authorization'].split(/Bearer /i)[1],
        loggedUser: LoggedUser = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
      userIdLog += loggedUser.userId;
    } catch (error) {
      userIdLog += ' unindentified';
    }

    message += `${method} ${userIdLog} ${originalUrl}`;

    if (this.bodyMethods.includes(method)) message += this.handleBodyDate(body);

    return next.handle().pipe(
      tap(() => {
        if (!this.prodLogLevels.includes(this.configService.get('LOG_LEVEL'))) {
          message += ` ${statusCode} ${Date.now() - now}ms`;
          return this.logger.log(message);
        }
      }),
      catchError((error) => {
        if (error.status >= 500) {
          message += ` ${statusCode} ${Date.now() - now}ms ${error.stack}`;
          this.logger.error(message);
        }
        if (error.status >= 400 && error.status < 500) {
          message += ` ${error.status} ${error.message} ${Date.now() - now}ms`;
          this.logger.warn(message);
        }
        return throwError(() => error);
      }),
    );
  }
  private handleBodyDate(body: any): string {
    const excludeProperties = ['undefined', '', undefined].includes(
      this.configService.get('EXCLUDE_PROPERTIES'),
    )
      ? []
      : this.configService.get('EXCLUDE_PROPERTIES').split(',');

    if (excludeProperties.length) {
      for (const excludeProperty of excludeProperties) {
        if (excludeProperty in body) {
          body = {
            ...body,
            [excludeProperty]: body[excludeProperty].replace(/./g, '*'),
          };
        }
      }
    }
    return ` ${JSON.stringify(body)}`;
  }
}
