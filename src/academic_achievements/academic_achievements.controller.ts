import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { AcademicAchievementsService } from './academic_achievements.service';
import { CreateAcademicAchievementTranslationDto } from './dto/create-academic-achievement-translation.dto';
import { UpdateAcademicAchievementTranslationDto } from './dto/update-academic-achievement-translation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';

@Controller('academic-achievements')
export class AcademicAchievementsController {
  constructor(private readonly service: AcademicAchievementsService) { }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post()
  createAchievement() {
    return this.service.createAchievement();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete('/:id')
  deleteAchievement(@Param('id') id: string) {
    return this.service.deleteAchievement(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post('translations')
  addTranslation(@Body() dto: CreateAcademicAchievementTranslationDto) {
    return this.service.addTranslation(dto);
  }

  @Get()
  getAchievementsByLanguage(@Query('lang') lang: string) {
    return this.service.getAchievementsByLanguage(lang);
  }

  @Get('/:id')
  getAchievementWithTranslation(@Param('id') id: string, @Query('lang') lang: string) {
    return this.service.getAchievementWithTranslation(id, lang);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Put('translations/:id')
  updateTranslation(@Param('id') id: string, @Body() dto: UpdateAcademicAchievementTranslationDto) {
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
}