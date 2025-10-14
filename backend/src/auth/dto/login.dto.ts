import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({example:'username/email'})
  @IsString() 
  @IsNotEmpty()
  userNameOrEmail: string;

  @ApiProperty({example:'password'})
  @IsString() 
  @IsNotEmpty()
  password: string;
}
