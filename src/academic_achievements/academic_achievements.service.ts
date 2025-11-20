import { Injectable, Logger, NotFoundException, Param, UploadedFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicAchievement } from './entities/academic_achievement.entity';
import { AcademicAchievementTranslation } from './entities/academic-achievement-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { CreateAcademicAchievementTranslationDto } from './dto/create-academic-achievement-translation.dto';
import { UpdateAcademicAchievementTranslationDto } from './dto/update-academic-achievement-translation.dto';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
//import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AcademicAchievementsService {
  private readonly logger = new Logger('AcademicAchievementsService');

  constructor(
    @InjectRepository(AcademicAchievement) private readonly achievementRepo: Repository<AcademicAchievement>,
    @InjectRepository(AcademicAchievementTranslation) private readonly translationRepo: Repository<AcademicAchievementTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
  ) { }

  async createAchievement() {
    const achievement = this.achievementRepo.create();
    return this.achievementRepo.save(achievement);
  }

  async deleteAchievement(id: string) {
    const achievement = await this.achievementRepo.findOne({ where: { id } });
    if (!achievement) throw new NotFoundException(`Achievement ${id} not found`);
    await this.achievementRepo.remove(achievement);
  }

  async addTranslation(dto: CreateAcademicAchievementTranslationDto) {
    const achievement = await this.achievementRepo.findOne({ where: { id: dto.academicAchievementId } });
    if (!achievement) throw new NotFoundException(`Achievement ${dto.academicAchievementId} not found`);

    const language = await this.languageRepo.findOne({ where: { id: dto.languageId } });
    if (!language) throw new NotFoundException(`Language ${dto.languageId} not found`);

    const translation = this.translationRepo.create({
      title: dto.title,
      content: dto.content,
      academicAchievement: achievement,
      language,
    });
    return this.translationRepo.save(translation);
  }

  async getAchievementsByLanguage(lang: string) {
    const translations = await this.translationRepo.find({
      where: { language: { code: lang } },
      relations: ['academicAchievement'],
    });

    return translations.map(t => ({
      id: t.academicAchievement.id,
      title: t.title,
      content: t.content,
      image: t.academicAchievement.image, // path relativo
    }));
  }

  async getAchievementWithTranslation(id: string, lang: string) {
    const translation = await this.translationRepo.findOne({
      where: { academicAchievement: { id }, language: { code: lang } },
      relations: ['academicAchievement'],
    });
    if (!translation) throw new NotFoundException(`Translation not found`);
    return {
      id: translation.academicAchievement.id,
      academicAchievementId: translation.academicAchievement.id,
      title: translation.title,
      content: translation.content,
      image: translation.academicAchievement.image,
    };
  }

  async updateTranslation(id: string, dto: UpdateAcademicAchievementTranslationDto) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new NotFoundException(`Translation ${id} not found`);
    if (dto.title) translation.title = dto.title;
    if (dto.content) translation.content = dto.content;
    return this.translationRepo.save(translation);
  }

  async deleteTranslation(id: string) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new NotFoundException(`Translation ${id} not found`);
    await this.translationRepo.remove(translation);
  }

  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const achievement = await this.achievementRepo.findOne({ where: { id } });
    if (!achievement) throw new NotFoundException(`Achievement ${id} not found`);


    const uploadDir = path.join(process.cwd(), 'uploads', 'images');

    // Crear carpeta si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.originalname);
    await fs.promises.writeFile(filePath, file.buffer);

    // Guardar solo el path relativo en DB
    achievement.image = path.join('uploads', 'images', file.originalname);


    // Para producción con S3:
    // const s3 = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY } });
    // await s3.send(new PutObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: `academic-achievements/${file.originalname}`, Body: file.buffer }));
    // achievement.image = `academic-achievements/${file.originalname}`; // Guardamos solo el Key

    return this.achievementRepo.save(achievement);
  }
}