
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateArticleTranslationDto } from './dto/create-article-translation.dto';
import { UpdateArticleTranslationDto } from './dto/update-article-translation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly service: ArticlesService) { }

  @Post()
  createArticle(@Body() dto: CreateArticleDto) {
    return this.service.createArticle(dto);
  }

  @Delete('/:id')
  deleteArticle(@Param('id') id: string) {
    return this.service.deleteArticle(id);
  }

  @Post('translations')
  addTranslation(@Body() dto: CreateArticleTranslationDto) {
    return this.service.addTranslation(dto);
  }

  @Get()
  getArticlesByLanguage(@Query('lang') lang: string) {
    return this.service.getArticlesByLanguage(lang);
  }

  @Get('/:id')
  getArticleWithTranslation(@Param('id') id: string, @Query('lang') lang: string) {
    return this.service.getArticleWithTranslation(id, lang);
  }

  @Put('translations/:id')
  updateTranslation(@Param('id') id: string, @Body() dto: UpdateArticleTranslationDto) {
    return this.service.updateTranslation(id, dto);
  }

  @Delete('translations/:id')
  deleteTranslation(@Param('id') id: string) {
    return this.service.deleteTranslation(id);
  }

  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage(id, file);
  }

  @Post('translations/:id/tags')
  addTagsToTranslation(@Param('id') id: string, @Body() dto: { tagIds: string[] }) {
    return this.service.addTagsToTranslation(id, dto.tagIds);
  }

  @Delete('translations/:id/tags/:tagId')
  removeTagFromTranslation(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.service.removeTagFromTranslation(id, tagId);
  }
}
