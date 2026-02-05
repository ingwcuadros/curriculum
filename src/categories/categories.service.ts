import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryTranslationDto } from './dto/create-category-translation.dto';
import { UpdateCategoryTranslationDto } from './dto/update-category-translation.dto';
import { BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger('CategoriesService');
  constructor(
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(CategoryTranslation) private readonly translationRepo: Repository<CategoryTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
  ) { }

  async createCategory(dto: CreateCategoryDto) {
    try {
      const category = this.categoryRepo.create();
      return await this.categoryRepo.save(category);
    } catch (error) {
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new BusinessLogicException(`Category ${categoryId} not found`, HttpStatus.NOT_FOUND);
    await this.categoryRepo.remove(category);
  }

  async addTranslation(dto: CreateCategoryTranslationDto) {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new BusinessLogicException(`Category ${dto.categoryId} not found`, HttpStatus.NOT_FOUND);

    const language = await this.languageRepo.findOne({ where: { id: dto.languageId } });
    if (!language) throw new BusinessLogicException(`Language ${dto.languageId} not found`, HttpStatus.NOT_FOUND);

    const translation = this.translationRepo.create({
      name: dto.name,
      description: dto.description,
      category,
      language,
    });
    return this.translationRepo.save(translation);
  }

  async getCategoriesByLanguage(languageCode: string) {
    try {
      const translations = await this.translationRepo.find({
        where: { language: { code: languageCode } },
        relations: ['category', 'language'],
      });

      return translations.map(t => ({
        id: t.category.id,
        name: t.name
      }));
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategoryWithTranslation(categoryId: string, languageCode: string) {
    try {
      const translation = await this.translationRepo.findOne({
        where: { category: { id: categoryId }, language: { code: languageCode } },
        relations: ['category', 'language'],
      });
      if (!translation) throw new BusinessLogicException(`Translation not found for category ${categoryId} and language ${languageCode}`, HttpStatus.NOT_FOUND);

      return {
        categoryId: translation.category.id,
        categoryTranslationId: translation.id,
        name: translation.name,
        description: translation.description,
        language: translation.language.code,
      };
    } catch (error) {
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTranslationByCategoryAndLang(categoryId: string, languageCode: string, dto: UpdateCategoryTranslationDto) {
    const translation = await this.translationRepo.findOne({
      where: { category: { id: categoryId }, language: { code: languageCode } },
      relations: ['category', 'language'],
    });

    if (!translation) {
      throw new BusinessLogicException(`Translation for category ${categoryId} and language ${languageCode} not found`, HttpStatus.NOT_FOUND);
    }

    if (dto.name) translation.name = dto.name;
    if (dto.description) translation.description = dto.description;

    const updated = await this.translationRepo.save(translation);

    return {
      categoryId: updated.category.id,
      categoryTranslationId: updated.id,
      name: updated.name,
      description: updated.description,
      language: updated.language.code,
    };
  }

  async deleteTranslation(id: string) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new BusinessLogicException(`Translation ${id} not found`, HttpStatus.NOT_FOUND);
    await this.translationRepo.remove(translation);
  }
}