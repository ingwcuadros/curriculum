
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createInitialUsers(dto: CreateUserDto, token: string) {
    // 1. Validar el token de inicialización (PRIMERA VALIDACIÓN)
    const expectedToken =
      process.env.INIT_USERS_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      throw new UnauthorizedException(
        'Token de inicialización inválido o no configurado.',
      );
    }

    // 2. Verificar si ya existen usuarios en la tabla
    const userCount = await this.userRepository.count();

    if (userCount > 0) {
      // Cumple con: "No debe permitir crear ningún usuario si los usuarios ya existen"
      throw new BadRequestException(
        'Ya existen usuarios en el sistema. La inicialización solo se puede hacer una vez.',
      );
    }

    // 3. Hashear las contraseñas
    const superadminPasswordHash = await bcrypt.hash(
      dto.superadminPassword,
      10,
    );
    const anonymousPasswordHash = await bcrypt.hash(
      dto.anonymousPassword,
      10,
    );

    // 4. Crear entidades
    const superadminUser = this.userRepository.create({
      username: dto.superadminUsername,
      passwordHash: superadminPasswordHash,
      role: dto.superadminRole,
    });

    const anonymousUser = this.userRepository.create({
      username: dto.anonymousUsername,
      passwordHash: anonymousPasswordHash,
      role: dto.anonymousRole,
    });

    // 5. Guardar ambos usuarios
    const savedUsers = await this.userRepository.save([
      superadminUser,
      anonymousUser,
    ]);

    return {
      message: 'Usuarios iniciales creados correctamente',
      users: savedUsers.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
      })),
    };
  }


  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }


  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }
}