import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    superadminUsername: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    superadminPassword: string;

    @IsString()
    @IsNotEmpty()
    superadminRole: string;

    @IsString()
    @IsNotEmpty()
    anonymousUsername: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    anonymousPassword: string;

    @IsString()
    @IsNotEmpty()
    anonymousRole: string;
}
