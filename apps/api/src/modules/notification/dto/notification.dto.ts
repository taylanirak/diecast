import { IsString, IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  // Order notifications
  ORDER_CREATED = 'order_created',
  ORDER_PAID = 'order_paid',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_REFUNDED = 'order_refunded',

  // Offer notifications
  OFFER_RECEIVED = 'offer_received',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
  OFFER_COUNTER = 'offer_counter',
  OFFER_EXPIRED = 'offer_expired',

  // Product notifications
  PRODUCT_APPROVED = 'product_approved',
  PRODUCT_REJECTED = 'product_rejected',

  // Payment notifications
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_RELEASED = 'payment_released',

  // Trade notifications (GAP-001)
  TRADE_RECEIVED = 'trade_received',
  TRADE_ACCEPTED = 'trade_accepted',
  TRADE_REJECTED = 'trade_rejected',
  TRADE_SHIPPED = 'trade_shipped',
  TRADE_COMPLETED = 'trade_completed',

  // Messaging notifications (GAP-002)
  NEW_MESSAGE = 'new_message',

  // General
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
}

export class SendNotificationDto {
  @ApiProperty({
    example: 'uuid-user-id',
    description: 'Target user ID',
  })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    enum: NotificationType,
    example: 'order_created',
    description: 'Notification type',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({
    example: ['email', 'push'],
    description: 'Channels to send notification',
    enum: NotificationChannel,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @ApiPropertyOptional({
    example: { orderId: 'uuid', amount: 250 },
    description: 'Additional data for the notification',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class NotificationResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid-user-id' })
  userId: string;

  @ApiProperty({ example: 'order_created' })
  type: string;

  @ApiProperty({ example: 'Siparişiniz oluşturuldu' })
  title: string;

  @ApiProperty({ example: 'Siparişiniz başarıyla oluşturuldu.' })
  message: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}

export class RegisterPushTokenDto {
  @ApiProperty({
    example: 'ExponentPushToken[xxxxx]',
    description: 'Expo push token',
  })
  @IsString()
  token: string;

  @ApiPropertyOptional({
    example: 'ios',
    description: 'Device platform',
    enum: ['ios', 'android', 'web'],
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    example: 'device-uuid-123',
    description: 'Device unique identifier',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
