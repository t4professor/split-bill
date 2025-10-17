import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment to settle debt' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  createPayment(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(req.user.sub, createPaymentDto);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get payment history for a group' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved' })
  getGroupPayments(@Request() req: any, @Param('groupId') groupId: string) {
    return this.paymentService.getGroupPayments(groupId, req.user.sub);
  }
}
