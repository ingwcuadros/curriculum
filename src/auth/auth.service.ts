
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Valida las credenciales y genera un JWT si son correctas.
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      // opcional: información del usuario
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
