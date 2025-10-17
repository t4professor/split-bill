import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // Create a new payment
  async createPayment(userId: string, data: CreatePaymentDto) {
    // Check if group exists and user is a member
    const group = await this.prisma.group.findUnique({
      where: { id: data.groupId },
      include: {
        members: true,
        expenses: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if current user is a member
    const isUserMember = group.members.some((m) => m.userId === userId);
    if (!isUserMember) {
      throw new BadRequestException('You are not a member of this group');
    }

    // Check if toUser is a member
    const isToUserMember = group.members.some((m) => m.userId === data.toUserId);
    if (!isToUserMember) {
      throw new BadRequestException('Recipient is not a member of this group');
    }

    // Cannot pay yourself
    if (userId === data.toUserId) {
      throw new BadRequestException('You cannot pay yourself');
    }

    // Calculate current settlement to validate payment
    const settlement = await this.calculateGroupSettlement(data.groupId);
    const transaction = settlement.transactions.find(
      (t) => t.fromUserId === userId && t.toUserId === data.toUserId,
    );

    if (!transaction) {
      throw new BadRequestException('You do not owe this person any money');
    }

    if (data.amount > transaction.amount) {
      throw new BadRequestException(
        `Payment amount (${data.amount}) exceeds debt (${transaction.amount})`,
      );
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        groupId: data.groupId,
        fromUserId: userId,
        toUserId: data.toUserId,
        amount: data.amount,
        note: data.note,
        status: PaymentStatus.CONFIRMED,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
        toUser: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
      },
    });

    return { message: 'Payment created successfully', payment };
  }

  // Get all payments for a group
  async getGroupPayments(groupId: string, userId: string) {
    // Check if group exists and user is a member
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new BadRequestException('You are not a member of this group');
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        groupId,
        status: PaymentStatus.CONFIRMED,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
        toUser: {
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

    return { payments };
  }

  // Helper: Calculate settlement (reused logic from group.service.ts but with payments)
  private async calculateGroupSettlement(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
              },
            },
          },
        },
        expenses: true,
        payments: {
          where: {
            status: PaymentStatus.CONFIRMED,
          },
        },
      },
    });

    // Calculate total expenses
    const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const memberCount = group.members.length;
    const fairSharePerPerson = memberCount > 0 ? totalExpenses / memberCount : 0;

    // Calculate how much each member paid
    const memberPaidMap = new Map<string, number>();
    group.members.forEach((member) => {
      memberPaidMap.set(member.userId, 0);
    });

    group.expenses.forEach((expense) => {
      const currentPaid = memberPaidMap.get(expense.paidById) || 0;
      memberPaidMap.set(expense.paidById, currentPaid + expense.amount);
    });

    // Calculate balances
    const balances = group.members.map((member) => {
      const totalPaid = memberPaidMap.get(member.userId) || 0;
      let balance = totalPaid - fairSharePerPerson;

      // Adjust balance based on payments
      const paidOut = group.payments
        .filter((p) => p.fromUserId === member.userId)
        .reduce((sum, p) => sum + p.amount, 0);

      const receivedIn = group.payments
        .filter((p) => p.toUserId === member.userId)
        .reduce((sum, p) => sum + p.amount, 0);

      // Paying increases your balance (reduces debt)
      // Receiving decreases your balance (reduces credit)
      balance = balance + paidOut - receivedIn;

      return {
        userId: member.userId,
        userName: member.user.userName,
        balance,
      };
    });

    // Calculate transactions
    const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance);

    const transactions = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount > 0.01) {
        transactions.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Math.round(amount * 100) / 100,
        });
      }

      creditor.balance -= amount;
      debtor.balance += amount;

      if (Math.abs(creditor.balance) < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j++;
    }

    return {
      transactions,
      balances,
    };
  }
}
