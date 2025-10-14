import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';

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
}
