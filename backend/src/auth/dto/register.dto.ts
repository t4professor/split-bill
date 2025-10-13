import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @IsNotEmpty()
  firstName: string;

  @IsString() @IsNotEmpty()
  lastName: string;

  @IsString() @IsNotEmpty()
  userName: string;

  @IsEmail() @IsNotEmpty()
  email: string;

  @IsString() @IsNotEmpty() 
  phoneNumber: string;

  @IsString() @MinLength(8)
  password: string;
}
