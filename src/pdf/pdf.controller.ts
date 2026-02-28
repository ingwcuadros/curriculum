
import {
  Controller, Post, Put, Delete, Get, Param, Body, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException, UseGuards
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'fileEn', maxCount: 1 },
      ],
      pdfUploadOptions, // misma config que usabas antes
    ),
  )

  async create(@Body() dto: CreatePdfDto, @UploadedFiles()
  files: {
    file?: Express.Multer.File[];
    fileEn?: Express.Multer.File[];
  },) {
    if (!files.file || files.file.length === 0) throw new BadRequestException('Debe subir un archivo PDF');
    if (!files.fileEn || files.fileEn.length === 0) throw new BadRequestException('Debe subir un archivo PDF en inglés');
    return this.pdfService.create(dto, files.file[0], files.fileEn[0]);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Put(':id')

  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'fileEn', maxCount: 1 },
      ],
      pdfUploadOptions, // misma config que usabas antes
    ),
  )


  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePdfDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      fileEn?: Express.Multer.File[];
    },
  ) {
    return this.pdfService.update(id, dto, files.file?.[0], files.fileEn?.[0]);
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
