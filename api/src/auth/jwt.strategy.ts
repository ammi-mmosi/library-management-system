import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './authenticated-user.interface';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET must be set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const id = Number(payload.sub);
    if (!Number.isSafeInteger(id) || id < 1) {
      throw new UnauthorizedException('Invalid token subject');
    }
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });
    if (!user || !Object.values(Role).includes(user.role)) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    return user;
  }
}
