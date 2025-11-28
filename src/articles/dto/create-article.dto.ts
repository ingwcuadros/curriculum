
import { IsOptional, IsUUID } from 'class-validator';

export class CreateArticleDto {
    @IsOptional()
    @IsUUID()
    categoryId?: string;
}
