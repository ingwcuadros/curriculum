import { Injectable, Logger, NotFoundException, Param, UploadedFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicAchievement } from './entities/academic_achievement.entity';
import { AcademicAchievementTranslation } from './entities/academic-achievement-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { CreateAcademicAchievementTranslationDto } from './dto/create-academic-achievement-translation.dto';
import { UpdateAcademicAchievementTranslationDto } from './dto/update-academic-achievement-translation.dto';
import { StorageService } from "../comon/storage/storage.service"
import { extractFileName } from '../comon/storage/file-path.helper';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';


@Injectable()
export class AcademicAchievementsService {
  private readonly logger = new Logger('AcademicAchievementsService');

  constructor(
    @InjectRepository(AcademicAchievement) private readonly achievementRepo: Repository<AcademicAchievement>,
    @InjectRepository(AcademicAchievementTranslation) private readonly translationRepo: Repository<AcademicAchievementTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
    private readonly storageService: StorageService,
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
      altImage: t.altImage,
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
      academicAchievementId: translation.id,
      title: translation.title,
      content: translation.content
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


    if (achievement.image) {
      const oldFileName = extractFileName(achievement.image);
      if (oldFileName) {
        await this.storageService.delete(oldFileName);
      }
    }

    // Generar nombre único para la nueva imagen
    const uniqueName = `${randomUUID()}-${file.originalname}`;
    file.originalname = uniqueName; // Sobrescribimos para que el StorageService lo use
    // Subir la nueva imagen (local o S3 según STORAGE_DRIVER)
    const newImagePath = await this.storageService.upload(file);
    achievement.image = newImagePath;
    return this.achievementRepo.save(achievement);
  }
}