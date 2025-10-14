import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({example: "just"})
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({example: "test"})
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({example: "justtesting"})
  @IsOptional()
  @IsString()
  @MinLength(3)
  userName?: string;

  @ApiPropertyOptional({example: "0987654321"})
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
