
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { BannerTranslation } from './entities/banner-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateBannerTranslationDto } from './dto/create-banner-translation.dto';
import { UpdateBannerTranslationDto } from './dto/update-banner-translation.dto';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
//import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class BannersService {
  private readonly logger = new Logger('BannersService');

  constructor(
    @InjectRepository(Banner) private readonly bannerRepo: Repository<Banner>,
    @InjectRepository(BannerTranslation) private readonly translationRepo: Repository<BannerTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
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
      tags: t.banner.tags,
    }));
  }

  /** Obtener banner con traducción */
  async getBannerWithTranslation(id: string, lang: string) {
    const translation = await this.translationRepo.findOne({
      where: { banner: { id }, language: { code: lang } },
      relations: ['banner'],
    });
    if (!translation) throw new NotFoundException(`Translation not found`);
    return {
      id: translation.banner.id,
      title: translation.title,
      textBanner: translation.textBanner,
      image: translation.banner.image,
      tags: translation.banner.tags,
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

    const uploadDir = path.join(process.cwd(), 'uploads', 'banners');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = `${randomUUID()}-${file.originalname}`;
    const filePath = path.join(uploadDir, uniqueName);
    await fs.promises.writeFile(filePath, file.buffer);

    banner.image = path.join('uploads', 'banners', uniqueName);

    // Para producción con S3:
    // const s3 = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY } });
    // await s3.send(new PutObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: `banners/${uniqueName}`, Body: file.buffer }));
    // banner.image = `banners/${uniqueName}`;

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
