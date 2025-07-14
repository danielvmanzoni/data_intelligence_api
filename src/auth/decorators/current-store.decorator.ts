// src/auth/decorators/current-tenant.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithTenant extends Request {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    type: string;
    brand: string | null;
    segment: string | null;
    isActive: boolean;
  };
}

export const CurrentStore = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithTenant>();
    return request.tenant.id;
  },
);
