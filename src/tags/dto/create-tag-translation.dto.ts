import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateTagTranslationDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;


    @IsUUID()
    tagId: string;


    @IsUUID()
    languageId: string;
}