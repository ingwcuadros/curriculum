
import { IsString, IsOptional } from 'class-validator';

export class CreatePdfDto {
    @IsString()
    fileName: string;

    @IsOptional()
    @IsString()
    metaKeywords?: string;
}
