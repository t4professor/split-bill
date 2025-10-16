
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password.dto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()

export class UserService {
  constructor(private prisma: PrismaService) {}


  async removeAvatar(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarPath: null },
    });
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: 'Password updated successfully' };
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateAvatar(userId: string, filePath: string): Promise<User> {
    const relativePath = filePath.replace(/^.*uploads[\\/]/, 'uploads/');
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarPath: relativePath },
    });
  }

  async updatePaymentQr(userId: string, filePath: string): Promise<User> {
    const relativePath = filePath.replace(/^.*uploads[\\/]/, 'uploads/');
    return this.prisma.user.update({
      where: { id: userId },
      data: { paymentQrPath: relativePath },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    if (data.userName) {
      const existing = await this.prisma.user.findUnique({
        where: { userName: data.userName },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Username already taken');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        userName: data.userName,
        phoneNumber: data.phoneNumber,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        phoneNumber: true,
        avatarPath: true,
        paymentQrPath: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
