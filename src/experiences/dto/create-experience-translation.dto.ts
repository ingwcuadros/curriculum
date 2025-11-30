import { IsNotEmpty, IsString, IsUUID } from "class-validator";


export class CreateExperienceTranslationDto {
    @IsUUID()
    @IsNotEmpty()
    experienceId: string;


    @IsUUID()
    @IsNotEmpty()
    languageId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}