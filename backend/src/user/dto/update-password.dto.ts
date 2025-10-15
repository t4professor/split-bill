import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({example: "oldpassword"})
  @IsString()
  currentPassword: string;

  @ApiProperty({example: "newpassword"})
  @IsString()
  @MinLength(6)
  newPassword: string;
}