
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateArticleTranslationDto {
    @IsUUID()
    @IsNotEmpty()
    articleId: string;

    @IsUUID()
    @IsNotEmpty()
    languageId: string;

    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsString()
    auxiliaryContent?: string;

    @IsOptional()
    @IsDateString()
    fecha?: Date;

    @IsOptional()
    @IsDateString()
    fechaEnd?: Date;

    @IsOptional()
    @IsString()
    promo?: string;
}
