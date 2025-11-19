import { Controller, Post, Delete, Get, Put, Param, Query, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryTranslationDto } from './dto/create-category-translation.dto';
import { UpdateCategoryTranslationDto } from './dto/update-category-translation.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Delete('categories/:categoryId')
  deleteCategory(@Param('categoryId') categoryId: string) {
    return this.categoriesService.deleteCategory(categoryId);
  }

  @Post('translations')
  addTranslation(@Body() dto: CreateCategoryTranslationDto) {
    return this.categoriesService.addTranslation(dto);
  }

  @Get()
  getCategoriesByLanguage(@Query('lang') lang: string) {
    return this.categoriesService.getCategoriesByLanguage(lang);
  }

  @Get('/:categoryId')
  getCategoryWithTranslation(@Param('categoryId') categoryId: string, @Query('lang') lang: string) {
    return this.categoriesService.getCategoryWithTranslation(categoryId, lang);
  }

  @Put('/:categoryId/translations')
  updateTranslationByCategoryAndLang(
    @Param('categoryId') categoryId: string,
    @Query('lang') lang: string,
    @Body() dto: UpdateCategoryTranslationDto
  ) {
    return this.categoriesService.updateTranslationByCategoryAndLang(categoryId, lang, dto);
  }

  @Delete('translations/:id')
  deleteTranslation(@Param('id') id: string) {
    return this.categoriesService.deleteTranslation(id);
  }
}