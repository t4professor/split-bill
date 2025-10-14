import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsUUID()
  groupId: string;
}
