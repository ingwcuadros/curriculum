
import {
  Controller, Post, Put, Delete, Get, Param, Body, UploadedFile, UseInterceptors, BadRequestException, UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import { pdfUploadOptions } from '../comon/storage/pdf-upload-options';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) { }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async create(@Body() dto: CreatePdfDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Debe subir un archivo PDF');
    return this.pdfService.create(dto, file);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  async update(@Param('id') id: string, @Body() dto: UpdatePdfDto, @UploadedFile() file?: Express.Multer.File) {
    return this.pdfService.update(id, dto, file);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.pdfService.delete(id);
  }
  @Get()
  async get() {
    return this.pdfService.get();
  }
}
