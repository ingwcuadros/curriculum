
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
import { GetPaginatedArticlesDto } from './dto/get-paginated-articles.dto';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/redis.service';


export interface SitemapItem {
  path: string;      // "/es/slug" o "/es"
  lastmod?: string;  // ISO date string
  type: 'home' | 'article';
}

// helper opcional para convertir fecha a ISO
const toIsoDateString = (date?: Date | string | null): string | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date.toISOString();
  const d = new Date(date); // si viene como string
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};


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
    private readonly redisService: RedisService
  ) { }

  async createArticle(dto: CreateArticleDto) {
    const article = this.articleRepo.create();
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new BusinessLogicException(`Category ${dto.categoryId} not found`, HttpStatus.NOT_FOUND);
      article.category = category;
    }
    await this.invalidateListArticlesChange();
    return this.articleRepo.save(article);
  }

  async deleteArticle(id: string) {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new BusinessLogicException(`Article ${id} not found`, HttpStatus.NOT_FOUND);
    await this.invalidateListArticlesChange();
    await this.articleRepo.remove(article);
  }

  async addTranslation(dto: CreateArticleTranslationDto) {
    const article = await this.articleRepo.findOne({ where: { id: dto.articleId } });
    if (!article) throw new BusinessLogicException(`Article ${dto.articleId} not found`, HttpStatus.NOT_FOUND);

    const language = await this.languageRepo.findOne({ where: { id: dto.languageId } });
    if (!language) throw new BusinessLogicException(`Language ${dto.languageId} not found`, HttpStatus.NOT_FOUND);

    const url = await this.generateUniqueSlug(dto.titulo);
    const translation = this.translationRepo.create({
      titulo: dto.titulo,
      url,
      content: dto.content,
      auxiliaryContent: dto.auxiliaryContent,
      altImage: dto.altImage,
      fecha: dto.fecha,
      fechaEnd: dto.fechaEnd,
      promo: dto.promo,
      article,
      language,
    });
    await this.invalidateArticleChange(url);
    return this.translationRepo.save(translation);
  }

  async getArticlesByLanguage(lang: string) {
    const translations = await this.translationRepo.find({
      where: { language: { code: lang } },
      relations: ['article'],
    });

    return translations.map(t => ({
      id: t.article.id,
      idTranslation: t.id,
      titulo: t.titulo,
      content: t.content,
      altImage: t.altImage,
      auxiliaryContent: t.auxiliaryContent,
      fecha: t.fecha,
      fechaEnd: t.fechaEnd,
      promo: t.promo,
      image: t.article.image,
      tags: t.tags,
      categoria: t.article.category,
    }));
  }

  async getArticleWithTranslation(identifier: string, lang: string) {


    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);

    const qb = this.translationRepo.createQueryBuilder('translation')
      .leftJoinAndSelect('translation.article', 'article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('translation.tags', 'tags')
      .leftJoinAndSelect('translation.language', 'translationLang')
      .leftJoinAndSelect('category.translations', 'categoryTranslations')
      .leftJoinAndSelect('categoryTranslations.language', 'categoryLang')
      .leftJoinAndSelect('tags.translations', 'tagTranslations')
      .leftJoinAndSelect('tagTranslations.language', 'tagLang')
      .where('translationLang.code = :lang', { lang });

    if (isUUID) {
      qb.andWhere('article.id = :identifier', { identifier });
    } else {
      qb.andWhere('translation.url = :identifier', { identifier });
    }

    const translation = await qb.getOne();

    if (!translation) {
      throw new BusinessLogicException(`Article not found`, HttpStatus.NOT_FOUND);
    }

    const categoryTranslation = translation.article.category.translations.find(t => t.language.code === lang);
    const tagTranslations = translation.tags.map(tag => {
      const tagTranslation = tag.translations.find(tt => tt.language.code === lang);
      return tagTranslation ? tagTranslation.name : null;
    }).filter(name => name !== null);

    return {
      id: translation.article.id,
      idTranslation: translation.id,
      titulo: translation.titulo,
      url: translation.url,
      content: translation.content,
      auxiliaryContent: translation.auxiliaryContent,
      fecha: translation.fecha,
      promo: translation.promo,
      image: translation.article.image,
      categoria: categoryTranslation ? categoryTranslation.name : null,
      tags: tagTranslations,
    };


  }

  async updateTranslation(id: string, dto: UpdateArticleTranslationDto) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new BusinessLogicException(`Translation ${id} not found`, HttpStatus.NOT_FOUND);

    if (dto.titulo && dto.titulo !== translation.titulo) {
      translation.url = await this.generateUniqueSlug(dto.titulo);
    }

    Object.assign(translation, dto);
    await this.invalidateArticleChange(translation.url);
    await this.invalidateListArticlesChange();
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
    await this.invalidateListArticlesChange();
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



  async getPaginatedArticles(query: GetPaginatedArticlesDto) {
    const { lang, page = 1, limit = 10, category, tags } = query;

    const baseQb = this.translationRepo
      .createQueryBuilder('translation')
      .leftJoin('translation.article', 'article')
      .leftJoin('article.category', 'category')
      .leftJoin('translation.tags', 'tag')
      .leftJoin('translation.language', 'language')
      .leftJoin('category.translations', 'categoryTranslation', 'categoryTranslation.language_id = language.id')
      .leftJoin('tag.translations', 'tagTranslation', 'tagTranslation.language_id = language.id')
      .where('language.code = :lang', { lang });

    // Filtro por categoría
    if (category) {
      baseQb.andWhere('LOWER(categoryTranslation.name) = LOWER(:category)', {
        category: category.trim(),
      });
    }

    // Filtro por tags
    if (tags) {
      const tagsArray = tags.split(',').map(t => t.trim());
      baseQb.andWhere('LOWER(tagTranslation.name) IN (:...tags)', { tags: tagsArray });
    }


    /**
         * 2) Total de artículos (COUNT DISTINCT article.id)
         */
    const totalRow = await baseQb
      .clone()
      .select('COUNT(DISTINCT article.id)', 'cnt')
      .getRawOne<{ cnt: string }>();

    const total = Number(totalRow?.cnt ?? 0);

    if (total === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    /**
     * 3) IDs de artículos para la página actual (DISTINCT + LIMIT/OFFSET)
     *    Aquí es donde realmente se aplica la paginación en SQL.
     */
    const idsRows = await baseQb
      .clone()
      .select('DISTINCT article.id', 'article_id')
      .orderBy('translation.fecha', 'DESC') // orden estable: cambia al campo que prefieras
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ article_id: number }>();

    const articleIds = idsRows.map((row) => row.article_id);

    if (!articleIds.length) {
      // Página fuera de rango: no hay artículos aunque total > 0
      return {
        items: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }


    /**
         * 4) Traer datos completos solo para esos artículos
         *    De nuevo usamos joins para categoría y tags, pero filtrando por articleIds.
         */
    const dataQb = this.translationRepo
      .createQueryBuilder('translation')
      .innerJoin('translation.article', 'article')
      .leftJoin('article.category', 'category')
      .leftJoin('translation.tags', 'tag')
      .innerJoin('translation.language', 'language')
      .leftJoin(
        'category.translations',
        'categoryTranslation',
        'categoryTranslation.language_id = language.id',
      )
      .leftJoin(
        'tag.translations',
        'tagTranslation',
        'tagTranslation.language_id = language.id',
      )
      .where('language.code = :lang', { lang })
      .andWhere('article.id IN (:...articleIds)', { articleIds })
      .orderBy('translation.fecha', 'DESC')
      .select([
        'article.id AS article_id',
        'article.image AS article_image',
        'translation.titulo AS translation_titulo',
        'translation.url AS translation_url',
        'translation.altImage AS translation_alt_image',
        'translation.content AS translation_content',
        'translation.auxiliaryContent AS translation_auxiliary_content',
        'translation.fecha AS translation_fecha',
        'translation.fechaEnd AS translation_fecha_end',
        'translation.promo AS translation_promo',
        'categoryTranslation.name AS category_name',
        'tagTranslation.name AS tag_name',
      ]);

    const rawResults = await dataQb.getRawMany();

    /**
         * 5) Agrupar por artículo para juntar los tags
         */
    const grouped = rawResults.reduce(
      (acc: Record<number, any>, row: any) => {
        if (!acc[row.article_id]) {
          acc[row.article_id] = {
            id: row.article_id,
            titulo: row.translation_titulo,
            url: row.translation_url,
            content: row.translation_content,
            altImage: row.translation_alt_image,
            auxiliaryContent: row.translation_auxiliary_content,
            fecha: row.translation_fecha,
            fechaEnd: row.translation_fecha_end,
            promo: row.translation_promo,
            image: row.article_image,
            category: row.category_name,
            tags: [] as string[],
          };
        }
        if (row.tag_name) {
          acc[row.article_id].tags.push(row.tag_name);
        }
        return acc;
      },
      {},
    );

    // Convertimos el objeto en array
    const items = Object.values(grouped);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };


  }


  private async generateUniqueSlug(titulo: string): Promise<string> {
    let slug = titulo
      .toLowerCase()
      .normalize('NFD') // Elimina acentos
      .replace(/[\u0300-\u036f]/g, '') // Quita diacríticos
      .replace(/[^a-z0-9\s-]/g, '') // Quita caracteres especiales
      .trim()
      .replace(/\s+/g, '-'); // Espacios por guiones

    const exists = await this.translationRepo.findOne({ where: { url: slug } });
    if (exists) {
      throw new BusinessLogicException(`El slug '${slug}' ya existe, elige otro título.`, HttpStatus.CONFLICT);
    }

    return slug;
  }

  async getArticlesProjectsByLanguage(lang: string) {


    const translations = await this.translationRepo.find({
      where: { language: { code: lang } },
      relations: ['article'],
      order: {
        fechaEnd: 'DESC', // ⬅️ Ordena por la fecha más reciente
      },
      take: 3, // ⬅️ Limita a 3 resultados
    });

    return translations.map(t => ({
      id: t.article.id,
      title: t.titulo,
      url: t.url,
      content: t.content,
      altImage: t.altImage,
      auxiliaryContent: t.auxiliaryContent,
      image: t.article.image,
    }));
  }


  async getSitemapItemsByLanguage(lang: string) {
    const translations = await this.translationRepo.find({
      where: { language: { code: lang } },
      relations: ['article'],
      order: {
        fechaEnd: 'DESC',
      },
    });
    const articleItems: SitemapItem[] = translations.map(t => {
      const slug = t.url;
      const path = `/${lang}/${slug}`;
      return {
        path,
        lastmod: toIsoDateString(t.fecha),
        type: 'article',
      };
    });
    const homeItem: SitemapItem = {
      path: `/${lang}`,
      lastmod: new Date().toISOString(),
      type: 'home',
    };
    return [homeItem, ...articleItems];
  }


  /**
   * Estrategia central de invalidación:
   * - Borra cache del listado
   * - Borra cache del detalle del producto afectado
   */
  private async invalidateListArticlesChange(): Promise<void> {

    // Invalidar todos los paginados
    await this.redisService.deleteByPattern('articles:paginated:*');

    await this.redisService.deleteByPattern('articles:limited:*');

  }

  private async invalidateArticleChange(articleId: number | string): Promise<void> {
    await this.redisService.deleteByPattern(`articles:id:${articleId}:*`);
  }
}
