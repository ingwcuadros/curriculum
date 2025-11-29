import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from './entities/experience.entity';
import { ExperienceTranslation } from './entities/experience-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { Article } from '../articles/entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experience, ExperienceTranslation, Language, Article]),
  ],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
})
export class ExperiencesModule { }
