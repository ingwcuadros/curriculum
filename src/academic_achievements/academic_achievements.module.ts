import { Module } from '@nestjs/common';
import { AcademicAchievementsService } from './academic_achievements.service';
import { AcademicAchievementsController } from './academic_achievements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicAchievement } from './entities/academic_achievement.entity';
import { AcademicAchievementTranslation } from './entities/academic-achievement-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { StorageModule } from '../comon/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicAchievement, AcademicAchievementTranslation, Language]), StorageModule],
  controllers: [AcademicAchievementsController],
  providers: [AcademicAchievementsService],
})
export class AcademicAchievementsModule { }
