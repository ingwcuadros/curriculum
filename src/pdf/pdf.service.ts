
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PdfResource } from './entities/pdf.entity';
import { StorageService } from '../comon/storage/storage.service';
import { extractFileName } from '../comon/storage/file-path.helper';
import { randomUUID } from 'crypto';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(PdfResource)
    private readonly pdfRepo: Repository<PdfResource>,
    private readonly storageService: StorageService,
  ) { }

  async create(dto: CreatePdfDto, file: Express.Multer.File) {
    const existing = await this.pdfRepo.find();
    if (existing.length > 0) {
      throw new BadRequestException('Solo se permite un registro. Elimine el existente para crear uno nuevo.');
    }

    const uniqueName = `${randomUUID()}-${file.originalname}`;
    file.originalname = uniqueName;

    const filePath = await this.storageService.upload(file);

    const pdf = this.pdfRepo.create({
      fileName: dto.fileName,
      metaKeywords: dto.metaKeywords,
      filePath,
    });

    return this.pdfRepo.save(pdf);
  }

  async update(id: string, dto: UpdatePdfDto, file?: Express.Multer.File) {
    const pdf = await this.pdfRepo.findOne({ where: { id } });
    if (!pdf) throw new NotFoundException(`PDF ${id} no encontrado`);

    if (file) {
      const oldFileName = extractFileName(pdf.filePath);
      if (oldFileName) {
        await this.storageService.delete(oldFileName);
      }

      const uniqueName = `${randomUUID()}-${file.originalname}`;
      file.originalname = uniqueName;
      pdf.filePath = await this.storageService.upload(file);
    }

    if (dto.fileName) pdf.fileName = dto.fileName;
    if (dto.metaKeywords) pdf.metaKeywords = dto.metaKeywords;

    return this.pdfRepo.save(pdf);
  }

  async delete(id: string) {
    const pdf = await this.pdfRepo.findOne({ where: { id } });
    if (!pdf) throw new NotFoundException(`PDF ${id} no encontrado`);

    const oldFileName = extractFileName(pdf.filePath);
    if (oldFileName) {
      await this.storageService.delete(oldFileName);
    }

    return this.pdfRepo.remove(pdf);
  }

  async get() {
    return this.pdfRepo.findOne({ where: {} });
  }

}
