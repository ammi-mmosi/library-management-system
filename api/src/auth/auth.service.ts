import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    let user: User;
    try {
      user = await this.prisma.user.create({
        data: { name: dto.name, email: dto.email.toLowerCase(), password },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    const passwordMatches = user
      ? await bcrypt.compare(dto.password, user.password)
      : false;
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  private async issueToken(user: Pick<User, 'id' | 'name' | 'email' | 'role'>) {
    const accessToken = await this.jwtService.signAsync({
      email: user.email,
      role: user.role,
      sub: String(user.id),
    });
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
