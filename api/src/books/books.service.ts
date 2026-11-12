import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

interface FindBooksOptions {
  genreId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    try {
      return await this.prisma.book.create({
        data: dto,
        include: { genre: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A book with this ISBN already exists');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('genreId does not reference an existing genre');
        }
      }
      throw error;
    }
  }

  async findAll(options: FindBooksOptions) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException('page must be positive and limit must be between 1 and 100');
    }

    const search = options.search?.trim();
    const where: Prisma.BookWhereInput = {
      ...(options.genreId !== undefined ? { genreId: options.genreId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        include: { genre: true },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: dto,
        include: { genre: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Book ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('A book with this ISBN already exists');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('genreId does not reference an existing genre');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.book.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Book ${id} not found`);
      }
      throw error;
    }
  }
}
