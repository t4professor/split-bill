import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}
