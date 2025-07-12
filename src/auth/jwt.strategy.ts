// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar se o usuário ainda existe e está ativo
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.isActive || !user.tenant.isActive) {
      throw new UnauthorizedException('Usuário inativo ou tenant inativo');
    }

    // Verificar se o tenant do JWT ainda corresponde ao tenant do usuário
    if (user.tenantId !== payload.tenantId) {
      throw new UnauthorizedException('Token inválido para este tenant');
    }

    return payload;
  }
}
