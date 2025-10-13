import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString() @IsNotEmpty()
  userNameOrEmail: string;

  @IsString() @IsNotEmpty()
  password: string;
}
