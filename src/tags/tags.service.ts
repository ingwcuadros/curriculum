import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { TagTranslation } from './entities/tag-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { CreateTagTranslationDto } from './dto/create-tag-translation.dto';
import { UpdateTranslationDto } from './dto/update-tag.dto';
import { BusinessLogicException } from '../shared/errors/business-errors';



@Injectable()
export class TagsService {

  private readonly logger = new Logger('TagsService')
  constructor(
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(TagTranslation) private readonly translationRepo: Repository<TagTranslation>,
    @InjectRepository(Language) private readonly languageRepo: Repository<Language>,
  ) { }



  async createTag(dto: CreateTagDto) {
    try {
      const tag = this.tagRepo.create();
      return this.tagRepo.save(tag);
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteTag(tagId: string) {
    const tag = await this.tagRepo.findOne({ where: { id: tagId } });
    if (!tag) throw new BusinessLogicException(`Tag ${tagId} not found`, HttpStatus.NOT_FOUND);
    await this.tagRepo.remove(tag); // Esto elimina también las traducciones por CASCADE
  }


  async addTranslation(dto: CreateTagTranslationDto) {
    const tag = await this.tagRepo.findOne({ where: { id: dto.tagId } });
    if (!tag) throw new BusinessLogicException(`Tag ${dto.tagId} not found`, HttpStatus.NOT_FOUND);

    const language = await this.languageRepo.findOne({ where: { id: dto.languageId } });
    if (!language) throw new BusinessLogicException(`Language ${dto.languageId} not found`, HttpStatus.NOT_FOUND);

    const translation = this.translationRepo.create({
      name: dto.name,
      description: dto.description,
      tag,
      language,
    });
    return this.translationRepo.save(translation);
  }


  async getTagsByLanguage(languageCode: string) {
    try {
      const translations = await this.translationRepo.find({
        where: { language: { code: languageCode } },
        relations: ['tag', 'language'],
      });

      return translations.map(t => ({
        tagId: t.tag.id,
        name: t.name,
        description: t.description,
        language: t.language.code,
      }));
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }



  async getTagWithTranslation(tagId: string, languageCode: string): Promise<any> {
    try {
      const translation = await this.translationRepo.findOne({
        where: { tag: { id: tagId }, language: { code: languageCode } },
        relations: ['tag', 'language'],
      });
      if (!translation) throw new BusinessLogicException(`Translation not found for tag ${tagId} and language ${languageCode}`, HttpStatus.NOT_FOUND);

      return {
        tagId: translation.tag.id,
        tagTranslationId: translation.id,
        name: translation.name,
        description: translation.description,
        language: translation.language.code,
      };
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }




  async updateTranslationByTagAndLang(tagId: string, languageCode: string, dto: UpdateTranslationDto): Promise<any> {
    const translation = await this.translationRepo.findOne({
      where: { tag: { id: tagId }, language: { code: languageCode } },
      relations: ['tag', 'language'],
    });

    if (!translation) {
      throw new BusinessLogicException(`Translation for tag ${tagId} and language ${languageCode} not found`, HttpStatus.NOT_FOUND);
    }

    if (dto.name) translation.name = dto.name;
    if (dto.description) translation.description = dto.description;

    const updated = await this.translationRepo.save(translation);

    return {
      tagId: updated.tag.id,
      tagTranslationId: updated.id,
      name: updated.name,
      description: updated.description,
      language: updated.language.code,
    };
  }



  async deleteTranslation(id: string): Promise<void> {
    const translation = await this.translationRepo.findOne({ where: { id } });
    if (!translation) throw new BusinessLogicException(`Translation ${id} not found`, HttpStatus.NOT_FOUND);
    await this.translationRepo.remove(translation);
  }
}
