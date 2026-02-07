
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';

import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true, // elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // lanza error si se envían propiedades extra
    transform: true,
  }),
)
export class ContactController {
  constructor(private readonly contactService: ContactService) { }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get()
  findAll() {
    return this.contactService.findAll();
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string,) {
    return this.contactService.findOne(id);
  }

  @Roles(Role.SUPERADMIN, Role.READER)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string,) {
    return this.contactService.remove(id);
  }
}
