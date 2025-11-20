import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateAcademicAchievementTranslationDto {
    @IsUUID()
    @IsNotEmpty()
    academicAchievementId: string;

    @IsUUID()
    @IsNotEmpty()
    languageId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}