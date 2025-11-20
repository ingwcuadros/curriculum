import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Category, CategoryTranslation, Language])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule { }
