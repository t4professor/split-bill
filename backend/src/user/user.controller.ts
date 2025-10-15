import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
  BadRequestException,
  NotFoundException,
  Patch,
  UsePipes,
  ValidationPipe,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UserService } from './user.service';
import {
  avatarStorage,
  paymentQrStorage,
  imageFileFilter,
  MAX_FILE_SIZE,
} from '../common/file-upload.utils';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { existsSync } from 'fs';
import { join } from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Upload avatar
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: avatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    await this.userService.updateAvatar(req.user.id, file.path);
    return { message: 'Avatar uploaded', path: file.path };
  }

  // Upload payment QR
  @UseGuards(JwtAuthGuard)
  @Post('payment-qr')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: paymentQrStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({ summary: 'Upload payment QR' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadPaymentQr(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    await this.userService.updatePaymentQr(req.user.id, file.path);
    return { message: 'Payment QR uploaded', path: file.path };
  }

  // 🖼 Get avatar by user ID
  @Get(':id/avatar')
  async getAvatar(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.findById(String(id));
    if (!user?.avatarPath) throw new NotFoundException('Avatar not found');

    const filePath = join(process.cwd(), user.avatarPath);
    if (!existsSync(filePath)) throw new NotFoundException('File missing');

    return res.sendFile(filePath);
  }

  // Get payment QR by user ID
  @Get(':id/payment-qr')
  async getPaymentQr(@Param('id') id: string, @Res() res: Response) {
    const targetUser = await this.userService.findById(String(id));
    if (!targetUser?.paymentQrPath)
      throw new NotFoundException('Payment QR not found');
    if (!existsSync(targetUser.paymentQrPath))
      throw new NotFoundException('File missing');

    return res.sendFile(targetUser.paymentQrPath, { root: '.' });
  }

  // Get current user's profile
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.userService.findById(req.user.id);
    if (!user) throw new NotFoundException('User not found');

    // remove sensitive fields
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // Update user profile
  @ApiOperation({ summary: "Used to update the user's profile"})
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }
}
