
import { IsOptional, IsString } from 'class-validator';

export class UpdateBannerTranslationDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    textBanner?: string;
}
