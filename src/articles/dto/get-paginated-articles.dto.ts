
// articles/dto/get-paginated-articles.dto.ts
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetPaginatedArticlesDto {
    @IsString()
    lang: string;

    @IsOptional()
    @IsNumberString()
    page?: number;

    @IsOptional()
    @IsNumberString()
    limit?: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    tags?: string; // lista separada por comas
}
