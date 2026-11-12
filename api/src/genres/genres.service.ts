import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({ data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A genre with this name already exists');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw new NotFoundException(`Genre ${id} not found`);
    }
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    try {
      return await this.prisma.genre.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Genre ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('A genre with this name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.genre.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Genre ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException('Genre cannot be deleted while it has books');
        }
      }
      throw error;
    }
  }
}
