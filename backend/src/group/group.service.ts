import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { SettlementResponse, MemberBalance, Transaction } from './dto/settlement-response.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  // Create a new group
  async createGroup(userId: string, data: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        createdById: userId,
        members: {
          create: {
            userId: userId, // Creator is automatically a member
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return { message: 'Group created successfully', group };
  }

  // Get all groups for a user
  async getUserGroups(userId: string) {
    const groups = await this.prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { groups };
  }

  // Get group details by ID
  async getGroupById(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        createdBy: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                email: true,
                avatarPath: true,
              },
            },
          },
        },
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

    return { group };
  }

  // Add a member to a group
  async addMember(groupId: string, data: AddMemberDto, requestUserId: string) {
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

    // Check if requester is a member
    const isRequesterMember = group.members.some((m) => m.userId === requestUserId);
    if (!isRequesterMember) {
      throw new BadRequestException('You are not a member of this group');
    }

    // Check if user to add exists
    const userToAdd = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some((m) => m.userId === data.userId);
    if (isAlreadyMember) {
      throw new BadRequestException('User is already a member of this group');
    }

    // Add member
    const member = await this.prisma.groupMember.create({
      data: {
        groupId: groupId,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            email: true,
          },
        },
      },
    });

    return { message: 'Member added successfully', member };
  }

  // Calculate settlement for a group
  async calculateSettlement(groupId: string, userId: string): Promise<SettlementResponse> {
    // Check if group exists and user is a member
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
        expenses: {
          include: {
            paidBy: {
              select: {
                id: true,
                userName: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is a member
    const isMember = group.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new BadRequestException('You are not a member of this group');
    }

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

    // Calculate balances for each member
    const balances: MemberBalance[] = group.members.map((member) => {
      const totalPaid = memberPaidMap.get(member.userId) || 0;
      const balance = totalPaid - fairSharePerPerson;

      return {
        userId: member.userId,
        userName: member.user.userName,
        totalPaid: Math.round(totalPaid * 100) / 100,
        fairShare: Math.round(fairSharePerPerson * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      };
    });

    // Calculate minimum transactions using greedy algorithm
    const transactions = this.calculateMinimumTransactions(balances);

    return {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      memberCount,
      fairSharePerPerson: Math.round(fairSharePerPerson * 100) / 100,
      balances,
      transactions,
    };
  }

  // Helper method: Calculate minimum transactions to settle all debts
  private calculateMinimumTransactions(balances: MemberBalance[]): Transaction[] {
    const transactions: Transaction[] = [];

    // Create arrays of debtors (negative balance) and creditors (positive balance)
    const debtors = balances
      .filter((b) => b.balance < -0.01)
      .map((b) => ({ ...b, balance: -b.balance }))
      .sort((a, b) => b.balance - a.balance);

    const creditors = balances
      .filter((b) => b.balance > 0.01)
      .sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(debtor.balance, creditor.balance);

      if (amount > 0.01) {
        transactions.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Math.round(amount * 100) / 100,
        });
      }

      debtor.balance -= amount;
      creditor.balance -= amount;

      if (debtor.balance < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return transactions;
  }
}
