import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class JoinGroupDto {
  @ApiProperty({
    description: 'Group invite code (8 characters)',
    example: 'ABCD1234',
    minLength: 8,
    maxLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  inviteCode: string;
}
