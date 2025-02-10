import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Put, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RecomendationsService } from './recomendations.service';
import { CreateRecomendationDto } from './dto/create-recomendation.dto';
import { UpdateRecomendationDto } from './dto/update-recomendation.dto';
import { extname } from 'path';
import * as crypto from 'crypto';

@Controller('recomendations')
export class RecomendationsController {
  constructor(private recomendationsService: RecomendationsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          // Generar nombre aleatorio con longitud limitada
          const randomName = crypto.randomUUID().slice(0, 14) + extname(file.originalname);
          callback(null, randomName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('Archivo recibido en /upload:', file);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const imgUrl = `/uploads/${file.filename}`;
    if (imgUrl.length > 255) {
      throw new BadRequestException('Image URL is too long');
    }

    return { imgUrl }; // Retorna la URL de la imagen
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          // Generar nombre único para el archivo
          const uniqueSuffix = crypto.randomUUID().slice(0, 8) + extname(file.originalname);
          callback(null, uniqueSuffix);
        },
      }),
    }),
  )
  async createRecomendation(
    @Body() data: CreateRecomendationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('Archivo recibido en /:', file);

    // Generar la URL pública de la imagen
    const imgUrl = file ? `http://localhost:3000/uploads/${file.filename}` : '';
    if (imgUrl.length > 255) {
      throw new BadRequestException('Image URL is too long');
    }

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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const randomName = crypto.randomUUID().slice(0, 8) + extname(file.originalname);
          callback(null, randomName);
        },
      }),
    }),
  )
  async updateRecomendation(
    @Param('id') id: string,
    @Body() data: UpdateRecomendationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Si se subió una nueva imagen, actualiza la URL
    const imgUrl = file ? `http://localhost:3000/uploads/${file.filename}` : data.img;

    if (imgUrl.length > 255) {
      throw new BadRequestException('Image URL is too long');
    }

    return this.recomendationsService.updateRecomendation(Number(id), { ...data, img: imgUrl });
  }

  @Delete(':id')
  async deleteRecomendation(@Param('id') id: string) {
    return this.recomendationsService.deleteRecomendation(Number(id));
  }
}
