import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { CreateTagTranslationDto } from './dto/create-tag-translation.dto';
import { UpdateTranslationDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';



@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  @Roles(Role.SUPERADMIN)
  @Post()
  createTag(@Body() dto: CreateTagDto) {
    return this.tagsService.createTag(dto);
  }

  @Roles(Role.SUPERADMIN)
  @Delete('tags/:tagId')
  deleteTag(@Param('tagId') tagId: string) {
    return this.tagsService.deleteTag(tagId);
  }

  @Roles(Role.SUPERADMIN)
  @Post('translations')
  addTranslation(@Body() dto: CreateTagTranslationDto) {
    return this.tagsService.addTranslation(dto);
  }

  @Roles(Role.SUPERADMIN, Role.READER)
  @Get()
  getTagsByLanguage(@Query('lang') lang: string) {
    return this.tagsService.getTagsByLanguage(lang);
  }

  @Roles(Role.SUPERADMIN, Role.READER)
  @Get('/:tagId')
  getTagWithTranslation(@Param('tagId') tagId: string, @Query('lang') lang: string) {
    return this.tagsService.getTagWithTranslation(tagId, lang);
  }


  @Roles(Role.SUPERADMIN)
  @Put('/:tagId/translations')
  updateTranslationByTagAndLang(
    @Param('tagId') tagId: string,
    @Query('lang') lang: string,
    @Body() dto: UpdateTranslationDto
  ) {
    return this.tagsService.updateTranslationByTagAndLang(tagId, lang, dto);
  }

  @Roles(Role.SUPERADMIN)
  @Delete('translations/:id')
  deleteTranslation(@Param('id') id: string) {
    return this.tagsService.deleteTranslation(id);
  }
}
