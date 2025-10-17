import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({ status: 201, description: 'Expense created', type: Object })
  createExpense(@Request() req: any, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.createExpense(req.user.sub, createExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense (owner only)' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only expense owner can delete' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  deleteExpense(@Request() req: any, @Param('id') expenseId: string) {
    return this.expenseService.deleteExpense(req.user.sub, expenseId);
  }
}
