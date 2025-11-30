import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceTranslationDto } from './dto/create-experience-translation.dto';
import { UpdateExperienceTranslationDto } from './dto/update-experience-translation.dto';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) { }

  @Post()
  create() {
    return this.experiencesService.createExperience();
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.experiencesService.deleteExperience(id);
  }

  @Post('translations')
  addTranslation(@Body() dto: CreateExperienceTranslationDto) {
    return this.experiencesService.addTranslation(dto);
  }


  @Get()
  getBannersByLanguage(@Param('lang') lang: string) {
    return this.experiencesService.getExperiencesByLanguage(lang);
  }

  @Get('/:id')
  getExperienceWithTranslation(@Param('id') id: string, @Param('lang') lang: string) {
    return this.experiencesService.getExperienceWithTranslation(id, lang);
  }

  @Put('translations/:id')
  updateTranslation(@Param('id') id: string, @Body() dto: UpdateExperienceTranslationDto) {
    return this.experiencesService.updateTranslation(id, dto);
  }

  @Post('/:id/articles')
  addArticlesToExperience(@Param('id') id: string, @Body() dto: { articleIds: string[] }) {
    return this.experiencesService.addArticlesToExperience(id, dto.articleIds);
  }
  @Delete('/:id/articles/:articleId')
  removeArticleFromExperience(@Param('id') id: string, @Param('articleId') articleId: string) {
    return this.experiencesService.removeArticleFromExperience(id, articleId);
  }
}
