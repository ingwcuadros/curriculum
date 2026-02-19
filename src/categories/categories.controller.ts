import { Controller, Post, Delete, Get, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryTranslationDto } from './dto/create-category-translation.dto';
import { UpdateCategoryTranslationDto } from './dto/update-category-translation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete('categories/:categoryId')
  deleteCategory(@Param('categoryId') categoryId: string) {
    return this.categoriesService.deleteCategory(categoryId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Put('/:categoryId/translations')
  updateTranslationByCategoryAndLang(
    @Param('categoryId') categoryId: string,
    @Query('lang') lang: string,
    @Body() dto: UpdateCategoryTranslationDto
  ) {
    return this.categoriesService.updateTranslationByCategoryAndLang(categoryId, lang, dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete('translations/:id')
  deleteTranslation(@Param('id') id: string) {
    return this.categoriesService.deleteTranslation(id);
  }
}