import { IsOptional, IsString } from 'class-validator';

export class UpdateAcademicAchievementTranslationDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;
}