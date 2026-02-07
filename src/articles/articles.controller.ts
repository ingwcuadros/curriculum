
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateArticleTranslationDto } from './dto/create-article-translation.dto';
import { UpdateArticleTranslationDto } from './dto/update-article-translation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { GetPaginatedArticlesDto } from './dto/get-paginated-articles.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';
import { RedisCache } from '../comon/decorators/redis-cache.decorator';

@Controller('articles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArticlesController {
  constructor(private readonly service: ArticlesService) { }

  @Roles(Role.SUPERADMIN)
  @Post()
  createArticle(@Body() dto: CreateArticleDto) {
    return this.service.createArticle(dto);
  }
  @Roles(Role.SUPERADMIN)
  @Delete('/:id')
  deleteArticle(@Param('id') id: string) {
    return this.service.deleteArticle(id);
  }
  @Roles(Role.SUPERADMIN)
  @Post('translations')
  addTranslation(@Body() dto: CreateArticleTranslationDto) {
    return this.service.addTranslation(dto);
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get()
  getArticlesByLanguage(@Query('lang') lang: string) {
    return this.service.getArticlesByLanguage(lang);
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get('sitemap')
  getSitemapItemsByLanguage(@Query('lang') lang: string) {
    return this.service.getSitemapItemsByLanguage(lang);
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get('limited')
  @RedisCache(300, 'articles:limited:{lang}')
  getArticlesLimitedByLanguage(@Query('lang') lang: string) {
    return this.service.getArticlesProjectsByLanguage(lang);
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get('paginated')
  @RedisCache(300, 'articles:paginated:{lang}:{category}:{tags}:{page}:{limit}')
  async getPaginated(@Query() query: GetPaginatedArticlesDto) {
    return this.service.getPaginatedArticles(query);
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get('/:identifier')
  @RedisCache(300, 'articles:id:{identifier}:{lang}')
  getArticleWithTranslation(@Param('identifier') identifier: string, @Query('lang') lang: string) {
    return this.service.getArticleWithTranslation(identifier, lang);
  }
  @Roles(Role.SUPERADMIN)
  @Put('translations/:id')
  updateTranslation(@Param('id') id: string, @Body() dto: UpdateArticleTranslationDto) {
    return this.service.updateTranslation(id, dto);
  }

  @Roles(Role.SUPERADMIN)
  @Delete('translations/:id')
  deleteTranslation(@Param('id') id: string) {
    return this.service.deleteTranslation(id);
  }

  @Roles(Role.SUPERADMIN)
  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage(id, file);
  }

  @Roles(Role.SUPERADMIN)
  @Post('translations/:id/tags')
  addTagsToTranslation(@Param('id') id: string, @Body() dto: { tagIds: string[] }) {
    return this.service.addTagsToTranslation(id, dto.tagIds);
  }

  @Roles(Role.SUPERADMIN)
  @Delete('translations/:id/tags/:tagId')
  removeTagFromTranslation(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.service.removeTagFromTranslation(id, tagId);
  }

}
