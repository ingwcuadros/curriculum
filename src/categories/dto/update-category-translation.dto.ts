import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryTranslationDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}