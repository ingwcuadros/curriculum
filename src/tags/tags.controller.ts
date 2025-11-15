import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { CreateTagTranslationDto } from './dto/create-tag-translation.dto';
import { UpdateTranslationDto } from './dto/update-tag.dto';


@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }


  @Post()
  createTag(@Body() dto: CreateTagDto) {
    return this.tagsService.createTag(dto);
  }


  @Delete('tags/:tagId')
  deleteTag(@Param('tagId') tagId: string) {
    return this.tagsService.deleteTag(tagId);
  }

  @Post('translations')
  addTranslation(@Body() dto: CreateTagTranslationDto) {
    return this.tagsService.addTranslation(dto);
  }


  @Get()
  getTagsByLanguage(@Query('lang') lang: string) {
    return this.tagsService.getTagsByLanguage(lang);
  }


  @Get('/:tagId')
  getTagWithTranslation(@Param('tagId') tagId: string, @Query('lang') lang: string) {
    return this.tagsService.getTagWithTranslation(tagId, lang);
  }



  @Put('/:tagId/translations')
  updateTranslationByTagAndLang(
    @Param('tagId') tagId: string,
    @Query('lang') lang: string,
    @Body() dto: UpdateTranslationDto
  ) {
    return this.tagsService.updateTranslationByTagAndLang(tagId, lang, dto);
  }


  @Delete('translations/:id')
  deleteTranslation(@Param('id') id: string) {
    return this.tagsService.deleteTranslation(id);
  }



}
