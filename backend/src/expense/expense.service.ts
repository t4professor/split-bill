import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  // Create a new expense
  async createExpense(userId: string, data: CreateExpenseDto) {
    // Check if group exists
    const group = await this.prisma.group.findUnique({
      where: { id: data.groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is a member of the group
    const isMember = group.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new BadRequestException('You are not a member of this group');
    }

    // Create the expense
    const expense = await this.prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        paidById: userId,
        groupId: data.groupId,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { message: 'Expense created successfully', expense };
  }

  // Get all expenses for a group
  async getGroupExpenses(groupId: string, userId: string) {
    // Check if group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is a member of the group
    const isMember = group.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new BadRequestException('You are not a member of this group');
    }

    // Get all expenses for the group
    const expenses = await this.prisma.expense.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { expenses };
  }

  // Delete an expense (owner only)
  async deleteExpense(userId: string, expenseId: string) {
    // Check if expense exists
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        group: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Check if user is the owner of the expense
    if (expense.paidById !== userId) {
      throw new ForbiddenException('Only the expense owner can delete this expense');
    }

    // Delete the expense
    await this.prisma.expense.delete({
      where: { id: expenseId },
    });

    return { message: 'Expense deleted successfully' };
  }
}
