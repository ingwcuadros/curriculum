
import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateBannerTranslationDto {
    @IsUUID()
    @IsNotEmpty()
    bannerId: string;

    @IsUUID()
    @IsNotEmpty()
    languageId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    textBanner: string;
}
