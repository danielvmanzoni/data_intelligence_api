// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  role: string;
  email: string;
  tenantType: string;
  brand?: string;
  segment?: string;
}
