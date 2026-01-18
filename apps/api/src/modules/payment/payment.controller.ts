import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  InitiatePaymentDto,
  IyzicoCallbackDto,
  PayTRCallbackDto,
  PaymentResponseDto,
  PaymentInitResponseDto,
  PaymentHoldResponseDto,
} from './dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * POST /payments/initiate - Initiate payment
   * Requirement: PayTR & Iyzico integration (project.md)
   */
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment for an order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment initiated',
    type: PaymentInitResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid order or payment not allowed',
  })
  async initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ): Promise<PaymentInitResponseDto> {
    return this.paymentService.initiatePayment(userId, dto);
  }

  /**
   * POST /payments/callback/iyzico - Iyzico webhook
   * Public endpoint for payment provider callbacks
   */
  @Post('callback/iyzico')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iyzico payment callback (webhook)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Callback processed' })
  async iyzicoCallback(@Body() dto: IyzicoCallbackDto) {
    return this.paymentService.handleIyzicoCallback(dto);
  }

  /**
   * POST /payments/callback/paytr - PayTR webhook
   * Public endpoint for payment provider callbacks
   */
  @Post('callback/paytr')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayTR payment callback (webhook)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Callback processed' })
  async paytrCallback(@Body() dto: PayTRCallbackDto) {
    return this.paymentService.handlePayTRCallback(dto);
  }

  /**
   * GET /payments/:id - Get payment details
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.findOne(id, userId);
  }

  /**
   * GET /payments/holds/me - Get seller's payment holds
   */
  @Get('holds/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current seller\'s payment holds' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of payment holds',
    type: [PaymentHoldResponseDto],
  })
  async getMyHolds(
    @CurrentUser('id') userId: string,
  ): Promise<PaymentHoldResponseDto[]> {
    return this.paymentService.getSellerHolds(userId);
  }
}
