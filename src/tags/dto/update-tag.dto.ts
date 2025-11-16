
import { IsString, IsOptional } from 'class-validator';

export class UpdateTranslationDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
