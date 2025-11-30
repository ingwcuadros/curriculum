import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { Experience } from './entities/experience.entity';
import { Repository, In } from 'typeorm';
import { ExperienceTranslation } from './entities/experience-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { Article } from '../articles/entities/article.entity';
import { BusinessLogicException } from '../shared/errors/business-errors';
import { CreateExperienceTranslationDto } from './dto/create-experience-translation.dto';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { UpdateExperienceTranslationDto } from './dto/update-experience-translation.dto';

@Injectable()
export class ExperiencesService {
  private readonly logger = new Logger('ExperiencesService');

  constructor(
    @InjectRepository(Experience) private readonly experienceRepo: Repository<Experience>,
    @InjectRepository(ExperienceTranslation) private readonly translationRepo: Repository<ExperienceTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
    @InjectRepository(Article) private readonly articleRepo: Repository<Article>,

  ) { }

  async createExperience() {
    try {
      const experience = this.experienceRepo.create();
      return this.experienceRepo.save(experience);
    } catch (error) {
      this.logger.error('Error creating experience', error.stack);
      throw new BusinessLogicException('Error creating experience', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteExperience(id: string) {
    const experience = await this.experienceRepo.findOne({ where: { id } });
    if (!experience) throw new BusinessLogicException(`Experience ${id} not found`, HttpStatus.NOT_FOUND);
    await this.experienceRepo.remove(experience);
  }

  async addTranslation(dto: CreateExperienceTranslationDto) {
    const experience = await this.experienceRepo.findOne({ where: { id: dto.experienceId } });
    if (!experience) throw new BusinessLogicException(`Experience ${dto.experienceId} not found`, HttpStatus.NOT_FOUND);

    const language = await this.languageRepo.findOne({ where: { id: dto.languageId } });
    if (!language) throw new BusinessLogicException(`Language ${dto.languageId} not found`, HttpStatus.NOT_FOUND);

    const translation = this.translationRepo.create({
      title: dto.title,
      content: dto.content,
      experience,
      language,
    });
    return this.translationRepo.save(translation);
  }


  async getExperiencesByLanguage(lang: string) {
    const translations = await this.translationRepo.find({
      where: { language: { code: lang } },
      relations: ['experience'],
    });
    return translations.map(t => ({
      id: t.experience.id,
      title: t.title,
      content: t.content,
    }));
  }

  async getExperienceWithTranslation(id: string, lang: string) {
    const translation = await this.translationRepo.findOne({
      where: {
        experience: { id },
        language: { code: lang },
      },
      relations: ['experience'],
    });
    if (!translation) throw new BusinessLogicException(`Translation for Experience ${id} in language ${lang} not found`, HttpStatus.NOT_FOUND);
    return {
      id: translation.experience.id,
      experienceId: translation.id,
      title: translation.title,
      content: translation.content,
    };
  }

  async updateTranslation(id: string, dto: UpdateExperienceTranslationDto) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new BusinessLogicException(`Translation ${id} not found`, HttpStatus.NOT_FOUND);
    if (dto.title) translation.title = dto.title;
    if (dto.content) translation.content = dto.content;
    return this.translationRepo.save(translation);
  }

  async deleteTranslation(id: string) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new BusinessLogicException(`Translation ${id} not found`, HttpStatus.NOT_FOUND);
    await this.translationRepo.remove(translation);
  }



  async addArticlesToExperience(experienceId: string, articleIds: string[]) {

    const experience = await this.experienceRepo.findOne({ where: { id: experienceId }, relations: ['articles'] });
    if (!experience) throw new BusinessLogicException(`Experience ${experienceId} not found`, HttpStatus.NOT_FOUND);

    const articles = await this.articleRepo.find({ where: { id: In(articleIds) } });
    experience.articles = [...(experience.articles || []), ...articles];
    return this.experienceRepo.save(experience);
  }


  async removeArticleFromExperience(experienceId: string, articleId: string) {
    const experience = await this.experienceRepo.findOne({ where: { id: experienceId }, relations: ['articles'] });
    if (!experience) throw new BusinessLogicException(`Experience ${experienceId} not found`, HttpStatus.NOT_FOUND);

    experience.articles = experience.articles.filter(article => article.id !== articleId);
    return this.experienceRepo.save(experience);
  }


}
