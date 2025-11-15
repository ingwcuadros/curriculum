import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService],
  imports: [
    TypeOrmModule.forFeature([Language]),
  ],
})
export class LanguagesModule { }
