import { Injectable } from '@nestjs/common';
import { CreateRecomendationDto } from './dto/create-recomendation.dto';
import { UpdateRecomendationDto } from './dto/update-recomendation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecomendationsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Método corregido para crear recomendación con imagen
  async createRecomendation(data: Omit<CreateRecomendationDto, 'idrecomendations'>) {
    return this.prisma.recomendations.create({
      data: {
        title: data.title,
        description: data.description,
        img: data.img, // 📌 Se guarda correctamente la URL en la base de datos
      } as Prisma.recomendationsUncheckedCreateInput,
    });
  }

  async getAllRecomendations() {
    return this.prisma.recomendations.findMany();
  }

  async getRecomendationById(id: number) {
    return this.prisma.recomendations.findUnique({ where: { idrecomendations: id } });
  }

  async updateRecomendation(id: number, data: UpdateRecomendationDto) {
    return this.prisma.recomendations.update({ where: { idrecomendations: id }, data });
  }

  async deleteRecomendation(id: number) {
    return this.prisma.recomendations.delete({ where: { idrecomendations: id } });
  }
}
