import { IsString, MinLength } from "class-validator";

export class CreateLanguageDto {
    @IsString({ message: 'El campo nombre debe ser un string' })
    @MinLength(1, { message: 'El campo nombre no debe estar vacío' })
    public name: string;

    @IsString({ message: 'El campo nombre debe ser un string' })
    @MinLength(1, { message: 'El campo nombre no debe estar vacío' })
    public code: string;

}
