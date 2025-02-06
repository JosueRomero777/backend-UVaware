import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';  // Asegúrate de importar esto

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: { email: string; password: string }, res: Response) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
  
    if (!admin) throw new UnauthorizedException('Invalid email or password');
  
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');
  
    const token = this.jwtService.sign({ id: admin.idadmin, email: admin.email });
  
    // Configurar la cookie correctamente
    res.cookie('token', token, {
      httpOnly: false, // Asegura que no sea accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      sameSite: 'lax',
      maxAge: 3600000, // 1 hora
    });
  
    // ❌ NO USAR `res.json()` directamente
    return { message: 'Login successful' };
  }
  
  async logout(res: Response) {
    // Elimina el token de la cookie cuando el usuario cierre sesión
    res.clearCookie('token'); // Borra la cookie 'token'
    res.clearCookie('PHPSESSID'); // Borra cualquier otra cookie de sesión

    return res.json({ message: 'Logged out successfully' });
  }

  // Función para registrar un usuario manualmente con email y contraseña
  async createInitialAdmin() {
    const email = 'rimero782@gmail.com';  // El email que deseas ingresar manualmente
    const password = 'gato';   // La contraseña que deseas ingresar manualmente

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario en la base de datos con el email y la contraseña hasheada
    const newUser = await this.prisma.admin.create({
      data: {
        email,
        password: hashedPassword,  // Contraseña hasheada
      },
    });

    return { message: 'User created successfully', userId: newUser.idadmin };
  }
}