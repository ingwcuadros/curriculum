import { PartialType } from '@nestjs/mapped-types';
import { CreateAcademicAchievementDto } from './create-academic_achievement.dto';

export class UpdateAcademicAchievementDto extends PartialType(CreateAcademicAchievementDto) {}
