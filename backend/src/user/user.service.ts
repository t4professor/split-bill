import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateAvatar(userId: number, filePath: string): Promise<User> {
    const relativePath = filePath.replace(/^.*uploads[\\/]/, 'uploads/');
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarPath: relativePath },
    });
  }

  async updatePaymentQr(userId: number, filePath: string): Promise<User> {
    const relativePath = filePath.replace(/^.*uploads[\\/]/, 'uploads/');
    return this.prisma.user.update({
      where: { id: userId },
      data: { paymentQrPath: relativePath },
    });
  }
  async updateProfile(userId: number, data: UpdateProfileDto) {
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
