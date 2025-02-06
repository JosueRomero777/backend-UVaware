import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RecomendationsService } from './recomendations.service';
import { CreateRecomendationDto } from './dto/create-recomendation.dto';
import { UpdateRecomendationDto } from './dto/update-recomendation.dto';
import { extname } from 'path';
import * as crypto from 'crypto'; // Importa crypto para generar nombres únicos


@Controller('recomendations')
export class RecomendationsController {
  constructor(private recomendationsService: RecomendationsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        // 📌 Generar nombre aleatorio
        const randomName = crypto.randomUUID() + extname(file.originalname);
        callback(null, randomName);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('Archivo recibido en /upload:', file);

    if (!file) {
      return { message: 'No file uploaded' };
    }

    return { imgUrl: `/uploads/${file.filename}` }; // La URL de la imagen
  }



  // ✅ Crear recomendación con imagen correctamente
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async createRecomendation(
    @Body() data: CreateRecomendationDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    console.log('Archivo recibido en /:', file);

    // 📌 Se genera correctamente la URL pública de la imagen
    const imgUrl = file ? `http://localhost:3000/uploads/${file.filename}` : '';

    return this.recomendationsService.createRecomendation({ ...data, img: imgUrl });
  }

  @Get()
  async getAllRecomendations() {
    return this.recomendationsService.getAllRecomendations();
  }

  @Get(':id')
  async getRecomendationById(@Param('id') id: string) {
    return this.recomendationsService.getRecomendationById(Number(id));
  }

  @Put(':id')
  async updateRecomendation(@Param('id') id: string, @Body() data: UpdateRecomendationDto) {
    return this.recomendationsService.updateRecomendation(Number(id), data);
  }

  @Delete(':id')
  async deleteRecomendation(@Param('id') id: string) {
    return this.recomendationsService.deleteRecomendation(Number(id));
  }
}
