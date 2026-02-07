import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceTranslationDto } from './dto/create-experience-translation.dto';
import { UpdateExperienceTranslationDto } from './dto/update-experience-translation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';

@Controller('experiences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) { }

  @Roles(Role.SUPERADMIN)
  @Post()
  create() {
    return this.experiencesService.createExperience();
  }

  @Roles(Role.SUPERADMIN)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.experiencesService.deleteExperience(id);
  }

  @Roles(Role.SUPERADMIN)
  @Post('translations')
  addTranslation(@Body() dto: CreateExperienceTranslationDto) {
    return this.experiencesService.addTranslation(dto);
  }

  @Roles(Role.SUPERADMIN, Role.READER)
  @Get()
  getBannersByLanguage(@Param('lang') lang: string) {
    return this.experiencesService.getExperiencesByLanguage(lang);
  }
  @Roles(Role.SUPERADMIN, Role.READER)
  @Get('/:id')
  getExperienceWithTranslation(@Param('id') id: string, @Query('lang') lang: string) {
    return this.experiencesService.getExperienceWithTranslation(id, lang);
  }
  @Roles(Role.SUPERADMIN)
  @Put('translations/:id')
  updateTranslation(@Param('id') id: string, @Body() dto: UpdateExperienceTranslationDto) {
    return this.experiencesService.updateTranslation(id, dto);
  }
  @Roles(Role.SUPERADMIN)
  @Post('/:id/articles')
  addArticlesToExperience(@Param('id') id: string, @Body() dto: { articleIds: string[] }) {
    return this.experiencesService.addArticlesToExperience(id, dto.articleIds);
  }

  @Roles(Role.SUPERADMIN)
  @Delete('/:id/articles/:articleId')
  removeArticleFromExperience(@Param('id') id: string, @Param('articleId') articleId: string) {
    return this.experiencesService.removeArticleFromExperience(id, articleId);
  }
}
