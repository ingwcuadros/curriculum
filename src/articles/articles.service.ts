
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleTranslation } from './entities/article-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateArticleTranslationDto } from './dto/create-article-translation.dto';
import { UpdateArticleTranslationDto } from './dto/update-article-translation.dto';
import { BusinessLogicException } from '../shared/errors/business-errors';
import { StorageService } from "../comon/storage/storage.service"
import { extractFileName } from '../comon/storage/file-path.helper';
import { randomUUID } from 'crypto';


@Injectable()
export class ArticlesService {
  private readonly logger = new Logger('ArticlesService');

  constructor(
    @InjectRepository(Article) private readonly articleRepo: Repository<Article>,
    @InjectRepository(ArticleTranslation) private readonly translationRepo: Repository<ArticleTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    private readonly storageService: StorageService,
  ) { }

  async createArticle(dto: CreateArticleDto) {
    const article = this.articleRepo.create();
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new BusinessLogicException(`Category ${dto.categoryId} not found`, HttpStatus.NOT_FOUND);
      article.category = category;
    }
    return this.articleRepo.save(article);
  }

  async deleteArticle(id: string) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new BusinessLogicException(`Article ${id} not found`, HttpStatus.NOT_FOUND);
    await this.articleRepo.remove(article);
  }

  async addTranslation(dto: CreateArticleTranslationDto) {
    const article = await this.articleRepo.findOne({ where: { id: dto.articleId } });
    if (!article) throw new BusinessLogicException(`Article ${dto.articleId} not found`, HttpStatus.NOT_FOUND);

    const language = await this.languageRepo.findOne({ where: { id: dto.languageId } });
    if (!language) throw new BusinessLogicException(`Language ${dto.languageId} not found`, HttpStatus.NOT_FOUND);

    const translation = this.translationRepo.create({
      titulo: dto.titulo,
      content: dto.content,
      auxiliaryContent: dto.auxiliaryContent,
      fecha: dto.fecha,
      fechaEnd: dto.fechaEnd,
      promo: dto.promo,
      article,
      language,
    });
    return this.translationRepo.save(translation);
  }

  async getArticlesByLanguage(lang: string) {
    const translations = await this.translationRepo.find({
      where: { language: { code: lang } },
      relations: ['article'],
    });

    return translations.map(t => ({
      id: t.article.id,
      titulo: t.titulo,
      content: t.content,
      auxiliaryContent: t.auxiliaryContent,
      fecha: t.fecha,
      fechaEnd: t.fechaEnd,
      promo: t.promo,
      image: t.article.image,
      tags: t.tags,
      categoria: t.article.category,
    }));
  }

  async getArticleWithTranslation(id: string, lang: string) {
    const translation = await this.translationRepo.findOne({
      where: { article: { id }, language: { code: lang } },
      relations: ['article'],
    });
    if (!translation) throw new BusinessLogicException(`Translation not found`, HttpStatus.NOT_FOUND);
    return {
      id: translation.article.id,
      idTranslation: translation.id,
      titulo: translation.titulo,
      content: translation.content,
      auxiliaryContent: translation.auxiliaryContent,
      fecha: translation.fecha,
      fechaEnd: translation.fechaEnd,
      promo: translation.promo,
      image: translation.article.image,
      tags: translation.tags,
      categoria: translation.article.category,
    };
  }

  async updateTranslation(id: string, dto: UpdateArticleTranslationDto) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new BusinessLogicException(`Translation ${id} not found`, HttpStatus.NOT_FOUND);
    Object.assign(translation, dto);
    return this.translationRepo.save(translation);
  }

  async deleteTranslation(id: string) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new BusinessLogicException(`Translation ${id} not found`, HttpStatus.NOT_FOUND);
    await this.translationRepo.remove(translation);
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new BusinessLogicException(`Article ${id} not found`, HttpStatus.NOT_FOUND);

    if (article.image) {
      const oldFileName = extractFileName(article.image);
      if (oldFileName) {
        await this.storageService.delete(oldFileName);
      }
    }

    const uniqueName = `${randomUUID()}-${file.originalname}`;
    file.originalname = uniqueName; // Sobrescribimos para que el StorageService lo use
    // Subir la nueva imagen (local o S3 según STORAGE_DRIVER)
    const newImagePath = await this.storageService.upload(file);
    article.image = newImagePath;
    return this.articleRepo.save(article);
  }

  async addTagsToTranslation(translationId: string, tagIds: string[]) {
    const translation = await this.translationRepo.findOne({ where: { id: translationId }, relations: ['tags'] });
    if (!translation) throw new BusinessLogicException(`Translation ${translationId} not found`, HttpStatus.NOT_FOUND);

    const tags = await this.tagRepo.find({ where: { id: In(tagIds) } });
    translation.tags = [...translation.tags, ...tags];
    return this.translationRepo.save(translation);
  }

  async removeTagFromTranslation(translationId: string, tagId: string) {
    const translation = await this.translationRepo.findOne({ where: { id: translationId }, relations: ['tags'] });
    if (!translation) throw new BusinessLogicException(`Translation ${translationId} not found`, HttpStatus.NOT_FOUND);

    translation.tags = translation.tags.filter(tag => tag.id !== tagId);
    return this.translationRepo.save(translation);
  }
}
