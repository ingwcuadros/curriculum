import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { Banner } from './entities/banner.entity';
import { BannerTranslation } from './entities/banner-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../tags/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, BannerTranslation, Language, Tag])],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule { }
