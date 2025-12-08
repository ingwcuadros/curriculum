
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { BannerTranslation } from './entities/banner-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateBannerTranslationDto } from './dto/create-banner-translation.dto';
import { UpdateBannerTranslationDto } from './dto/update-banner-translation.dto';
import { StorageService } from "../comon/storage/storage.service"
import { extractFileName } from '../comon/storage/file-path.helper';
import { randomUUID } from 'crypto';

@Injectable()
export class BannersService {
  private readonly logger = new Logger('BannersService');

  constructor(
    @InjectRepository(Banner) private readonly bannerRepo: Repository<Banner>,
    @InjectRepository(BannerTranslation) private readonly translationRepo: Repository<BannerTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    private readonly storageService: StorageService,
  ) { }

  /** Crear banner vacío */
  async createBanner() {
    const banner = this.bannerRepo.create();
    return this.bannerRepo.save(banner);
  }

  /** Eliminar banner y sus traducciones */
  async deleteBanner(id: string) {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner ${id} not found`);
    await this.bannerRepo.remove(banner);
  }

  /** Crear traducción */
  async addTranslation(dto: CreateBannerTranslationDto) {
    const banner = await this.bannerRepo.findOne({ where: { id: dto.bannerId } });
    if (!banner) throw new NotFoundException(`Banner ${dto.bannerId} not found`);

    const language = await this.languageRepo.findOne({ where: { id: dto.languageId } });
    if (!language) throw new NotFoundException(`Language ${dto.languageId} not found`);

    const translation = this.translationRepo.create({
      title: dto.title,
      textBanner: dto.textBanner,
      banner,
      language,
    });
    return this.translationRepo.save(translation);
  }

  /** Listar banners con traducción en idioma */
  async getBannersByLanguage(lang: string) {
    const translations = await this.translationRepo.find({
      where: { language: { code: lang } },
      relations: ['banner'],
    });

    return translations.map(t => ({
      id: t.banner.id,
      title: t.title,
      textBanner: t.textBanner,
      image: t.banner.image,
      altImage: t.altImage,
      tags: t.banner.tags,
    }));
  }

  /** Obtener banner con traducción */
  async getBannerWithTranslation(id: string, lang: string) {

    const qb = this.translationRepo.createQueryBuilder('translation')
      .leftJoinAndSelect('translation.banner', 'banner')
      .leftJoinAndSelect('translation.language', 'translationLang')
      .leftJoinAndSelect('banner.tags', 'tags')
      .leftJoinAndSelect('tags.translations', 'tagTranslations')
      .leftJoinAndSelect('tagTranslations.language', 'tagLang')
      .where('translation.banner.id = :id', { id })
      .andWhere('translationLang.code = :lang', { lang });
    const translation = await qb.getOne();
    if (!translation) throw new NotFoundException(`Translation not found`);
    const tagTranslations = translation.banner.tags.map(tag => {
      const tagTranslation = tag.translations.find(tt => tt.language.code === lang);
      return tagTranslation ? tagTranslation.name : null;
    }).filter(name => name !== null);
    return {
      id: translation.banner.id,
      bannerId: translation.id,
      title: translation.title,
      textBanner: translation.textBanner,
      altImage: translation.altImage,
      image: translation.banner.image,
      tags: tagTranslations
    };
  }

  /** Actualizar traducción */
  async updateTranslation(id: string, dto: UpdateBannerTranslationDto) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new NotFoundException(`Translation ${id} not found`);
    if (dto.title) translation.title = dto.title;
    if (dto.textBanner) translation.textBanner = dto.textBanner;
    return this.translationRepo.save(translation);
  }

  /** Eliminar traducción */
  async deleteTranslation(id: string) {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new NotFoundException(`Translation ${id} not found`);
    await this.translationRepo.remove(translation);
  }

  /** Subir imagen con UUID + nombre original */
  async uploadImage(id: string, file: Express.Multer.File) {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner ${id} not found`);


    if (banner.image) {
      const oldFileName = extractFileName(banner.image);
      if (oldFileName) {
        await this.storageService.delete(oldFileName);
      }
    }
    // Generar nombre único para la nueva imagen
    const uniqueName = `${randomUUID()}-${file.originalname}`;
    file.originalname = uniqueName; // Sobrescribimos para que el StorageService lo use
    // Subir la nueva imagen (local o S3 según STORAGE_DRIVER)
    const newImagePath = await this.storageService.upload(file);
    // Actualizar el banner con la nueva ruta
    banner.image = newImagePath;
    return this.bannerRepo.save(banner);
  }

  /** Asociar tags a banner */
  async addTagsToBanner(bannerId: string, tagIds: string[]) {
    const banner = await this.bannerRepo.findOne({ where: { id: bannerId }, relations: ['tags'] });
    if (!banner) throw new NotFoundException(`Banner ${bannerId} not found`);

    const tags = await this.tagRepo.find({ where: { id: In(tagIds) } });
    banner.tags = [...banner.tags, ...tags];
    return this.bannerRepo.save(banner);
  }

  /** Quitar tag de banner */
  async removeTagFromBanner(bannerId: string, tagId: string) {
    const banner = await this.bannerRepo.findOne({ where: { id: bannerId }, relations: ['tags'] });
    if (!banner) throw new NotFoundException(`Banner ${bannerId} not found`);

    banner.tags = banner.tags.filter(tag => tag.id !== tagId);
    return this.bannerRepo.save(banner);
  }
}
