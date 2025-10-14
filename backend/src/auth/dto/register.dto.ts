import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({example:'Just'})
  @IsString() 
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({example:'Testing'})
  @IsString() 
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({example:'JustTesting'})
  @IsString() 
  @IsNotEmpty()
  userName: string;

  @ApiProperty({example:'JustTesting@example.com'})
  @IsEmail() 
  @IsNotEmpty()
  email: string;

  @ApiProperty({example:'0987654321'})
  @IsString() 
  @IsNotEmpty() 
  phoneNumber: string;

  @ApiProperty({example:'password'})
  @IsString() 
  @MinLength(8)
  password: string;
}
