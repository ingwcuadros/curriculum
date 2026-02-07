import {
  Body,
  Controller,
  Headers,
  Post
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';





@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @Post('init-users')
  async initUsers(
    @Body() dto: CreateUserDto,
    @Headers('x-setup-token') setupToken: string,
  ) {
    // Pasamos el token directamente al servicio,
    // donde se hace la primera validación.
    return this.usersService.createInitialUsers(dto, setupToken);
  }

}
