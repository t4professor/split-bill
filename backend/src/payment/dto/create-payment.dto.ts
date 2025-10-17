import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Group ID' })
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty({ description: 'User ID to pay to (creditor)' })
  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment note', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
