import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryTranslationDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsUUID()
    categoryId: string;

    @IsUUID()
    languageId: string;
}