import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: 'Email or username of the user to add' })
  @IsString()
  @IsNotEmpty()
  userEmailOrUsername: string;
}
