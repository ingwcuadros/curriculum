import { IsOptional, IsString } from "class-validator";


export class UpdateExperienceTranslationDto {

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;
}