import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  createExpense(@Request() req: any, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.createExpense(req.user.sub, createExpenseDto);
  }

  @Get('group/:groupId')
  getGroupExpenses(@Param('groupId') groupId: string, @Request() req: any) {
    return this.expenseService.getGroupExpenses(groupId, req.user.sub);
  }
}
