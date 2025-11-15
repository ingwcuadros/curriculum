import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessLogicException } from '../shared/errors/business-errors';
import { Language } from './entities/language.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LanguagesService {

  private readonly logger = new Logger('LanguagesService')
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) { }
  async create(createLanguageDto: CreateLanguageDto) {
    try {
      const language = this.languageRepository.create(createLanguageDto);
      await this.languageRepository.save(language);
      return language;
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async findAll() {
    try {
      return await this.languageRepository.find();
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async findOne(id: string) {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language)
      throw new BusinessLogicException('The language with the given id was not found', HttpStatus.NOT_FOUND)
    return language;
  }

  async update(id: string, updateLanguageDto: UpdateLanguageDto) {
    const language = await this.languageRepository.preload({
      id: id,
      ...updateLanguageDto
    });
    if (!language)
      throw new BusinessLogicException('The language with the given id was not found', HttpStatus.NOT_FOUND)
    try {
      return await this.languageRepository.save(language);
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async remove(id: string) {
    const language = await this.findOne(id);
    try {
      await this.languageRepository.remove(language);
    } catch (error) {
      this.logger.error(error)
      throw new BusinessLogicException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
