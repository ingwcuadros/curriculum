
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerTranslationDto } from './dto/create-banner-translation.dto';
import { UpdateBannerTranslationDto } from './dto/update-banner-translation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';

@Controller('banners')
export class BannersController {
  constructor(private readonly service: BannersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post()
  createBanner() {
    return this.service.createBanner();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete('/:id')
  deleteBanner(@Param('id') id: string) {
    return this.service.deleteBanner(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post('translations')
  addTranslation(@Body() dto: CreateBannerTranslationDto) {
    return this.service.addTranslation(dto);
  }

  @Get()
  getBannersByLanguage(@Query('lang') lang: string) {
    return this.service.getBannersByLanguage(lang);
  }

  @Get('/:id')
  getBannerWithTranslation(@Param('id') id: string, @Query('lang') lang: string) {
    return this.service.getBannerWithTranslation(id, lang);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Put('translations/:id')
  updateTranslation(@Param('id') id: string, @Body() dto: UpdateBannerTranslationDto) {
    return this.service.updateTranslation(id, dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete('translations/:id')
  deleteTranslation(@Param('id') id: string) {
    return this.service.deleteTranslation(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post('/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage(id, file);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post('/:id/tags')
  addTagsToBanner(@Param('id') id: string, @Body() dto: { tagIds: string[] }) {
    return this.service.addTagsToBanner(id, dto.tagIds);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete('/:id/tags/:tagId')
  removeTagFromBanner(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.service.removeTagFromBanner(id, tagId);
  }
}
