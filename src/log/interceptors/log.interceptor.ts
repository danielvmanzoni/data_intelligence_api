import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LogService } from '../log.service';
import { Request } from 'express';

interface JwtPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const method = req.method;
    const url = req.originalUrl ?? req.url;
    const user = req.user;

    const userId = user?.userId;
    const tenantId = user?.tenantId;
    const entity = url.split('/')[1]?.toUpperCase() ?? 'UNKNOWN';

    return next.handle().pipe(
      tap(() => {
        if (!userId || !tenantId) return;
        if (!['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) return;

        const action = `${method}_${entity}`;
        const message = `${method} ${url}`;

        void this.logService.create({
          action,
          entity,
          entityId: 'unknown', // Será sobrescrito pelos services específicos
          message,
          tenantId,
          userId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }),
    );
  }
}
