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
  ForbiddenException,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user.type';
import { join } from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: avatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    await this.userService.updateAvatar(user.id, file.path);
    return { message: 'Avatar uploaded', path: file.path };
  }

  @UseGuards(JwtAuthGuard)
  @Post('payment-qr')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: paymentQrStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadPaymentQr(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    await this.userService.updatePaymentQr(user.id, file.path);
    return { message: 'Payment QR uploaded', path: file.path };
  }

  @Get(':id/avatar')
    async getAvatar(@Param('id') id: number, @Res() res: Response) {
    const user = await this.userService.findById(Number(id));
    if (!user?.avatarPath) throw new NotFoundException('Avatar not found');

    const filePath = join(process.cwd(), user.avatarPath);
    if (!existsSync(filePath)) throw new NotFoundException('File missing');

    return res.sendFile(filePath);
    }

  // Get payment QR
  @Get(':id/payment-qr')
  async getPaymentQr(
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const targetUser = await this.userService.findById(Number(id));
    if (!targetUser?.paymentQrPath) throw new NotFoundException('Payment QR not found');
    if (!existsSync(targetUser.paymentQrPath)) throw new NotFoundException('File missing');

    return res.sendFile(targetUser.paymentQrPath, { root: '.' });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }
}
