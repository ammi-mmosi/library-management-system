import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() request: AuthenticatedRequest) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: request.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }
}
