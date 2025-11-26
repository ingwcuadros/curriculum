
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateArticleTranslationDto {
    @IsOptional()
    @IsString()
    titulo?: string;

    @IsOptional()
    @IsString()
    content?: string;

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
