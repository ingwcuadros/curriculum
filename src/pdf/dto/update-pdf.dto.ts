
import { IsString, IsOptional } from 'class-validator';

export class UpdatePdfDto {
    @IsOptional()
    @IsString()
    fileName?: string;

    @IsOptional()
    @IsString()
    metaKeywords?: string;
}
