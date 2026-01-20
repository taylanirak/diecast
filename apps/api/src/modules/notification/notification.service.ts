/**
 * Notification Service
 * GAP-014: Real Notification Providers (Expo, SendGrid, SMS)
 *
 * Requirement: Push notifications, email, SMS (project.md)
 * Provides unified notification interface with real provider integrations
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';
import {
  SendNotificationDto,
  NotificationType,
  NotificationChannel,
  RegisterPushTokenDto,
} from './dto';
import { SendGridProvider } from './providers/sendgrid.provider';
import { ExpoPushProvider } from './providers/expo-push.provider';
import { SmsProvider } from './providers/sms.provider';

// Notification templates (Turkish)
const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; message: string }> = {
  [NotificationType.ORDER_CREATED]: {
    title: 'Siparişiniz Oluşturuldu',
    message: 'Siparişiniz başarıyla oluşturuldu. Ödeme bekleniyor.',
  },
  [NotificationType.ORDER_PAID]: {
    title: 'Ödeme Alındı',
    message: 'Siparişiniz için ödeme alındı. Satıcı siparişinizi hazırlıyor.',
  },
  [NotificationType.ORDER_SHIPPED]: {
    title: 'Siparişiniz Kargoya Verildi',
    message: 'Siparişiniz kargoya verildi. Takip numaranız: {{trackingNumber}}',
  },
  [NotificationType.ORDER_DELIVERED]: {
    title: 'Siparişiniz Teslim Edildi',
    message: 'Siparişiniz teslim edildi. Lütfen onaylayın.',
  },
  [NotificationType.ORDER_COMPLETED]: {
    title: 'Sipariş Tamamlandı',
    message: 'Siparişiniz başarıyla tamamlandı. Teşekkür ederiz!',
  },
  [NotificationType.ORDER_CANCELLED]: {
    title: 'Sipariş İptal Edildi',
    message: 'Siparişiniz iptal edildi.',
  },
  [NotificationType.ORDER_REFUNDED]: {
    title: 'İade İşlemi Tamamlandı',
    message: 'Ödemeniz iade edildi.',
  },
  [NotificationType.OFFER_RECEIVED]: {
    title: 'Yeni Teklif Aldınız',
    message: 'Ürününüz için {{amount}} TL teklif aldınız.',
  },
  [NotificationType.OFFER_ACCEPTED]: {
    title: 'Teklifiniz Kabul Edildi',
    message: 'Teklifiniz kabul edildi. Siparişi tamamlayın.',
  },
  [NotificationType.OFFER_REJECTED]: {
    title: 'Teklifiniz Reddedildi',
    message: 'Teklifiniz satıcı tarafından reddedildi.',
  },
  [NotificationType.OFFER_COUNTER]: {
    title: 'Karşı Teklif Aldınız',
    message: 'Satıcı {{amount}} TL karşı teklif yaptı.',
  },
  [NotificationType.OFFER_EXPIRED]: {
    title: 'Teklifin Süresi Doldu',
    message: 'Teklifinizin süresi doldu.',
  },
  [NotificationType.PRODUCT_APPROVED]: {
    title: 'Ürününüz Onaylandı',
    message: 'Ürününüz onaylandı ve yayında.',
  },
  [NotificationType.PRODUCT_REJECTED]: {
    title: 'Ürününüz Reddedildi',
    message: 'Ürününüz onaylanmadı. Neden: {{reason}}',
  },
  [NotificationType.PAYMENT_RECEIVED]: {
    title: 'Ödeme Alındı',
    message: 'Satış için {{amount}} TL ödeme alındı.',
  },
  [NotificationType.PAYMENT_RELEASED]: {
    title: 'Ödemeniz Aktarıldı',
    message: '{{amount}} TL hesabınıza aktarıldı.',
  },
  [NotificationType.WELCOME]: {
    title: "Tarodan'a Hoş Geldiniz!",
    message: 'Diecast model araba koleksiyoncuları platformuna hoş geldiniz.',
  },
  [NotificationType.PASSWORD_RESET]: {
    title: 'Şifre Sıfırlama',
    message: 'Şifrenizi sıfırlamak için linke tıklayın.',
  },
  [NotificationType.EMAIL_VERIFICATION]: {
    title: 'E-posta Doğrulama',
    message: 'E-postanızı doğrulamak için linke tıklayın.',
  },
  [NotificationType.TRADE_RECEIVED]: {
    title: 'Yeni Takas Teklifi',
    message: 'Ürünleriniz için bir takas teklifi aldınız.',
  },
  [NotificationType.TRADE_ACCEPTED]: {
    title: 'Takas Kabul Edildi',
    message: 'Takas teklifiniz kabul edildi. Lütfen kargoya verin.',
  },
  [NotificationType.TRADE_REJECTED]: {
    title: 'Takas Reddedildi',
    message: 'Takas teklifiniz reddedildi.',
  },
  [NotificationType.TRADE_SHIPPED]: {
    title: 'Takas Kargoya Verildi',
    message: 'Takas paketiniz kargoya verildi.',
  },
  [NotificationType.TRADE_COMPLETED]: {
    title: 'Takas Tamamlandı',
    message: 'Takas işlemi başarıyla tamamlandı!',
  },
  [NotificationType.NEW_MESSAGE]: {
    title: 'Yeni Mesaj',
    message: '{{senderName}} size bir mesaj gönderdi.',
  },
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly sendGridProvider: SendGridProvider,
    private readonly expoPushProvider: ExpoPushProvider,
    private readonly smsProvider: SmsProvider,
  ) {}

  /**
   * Send notification to a user through specified channels
   * Uses REAL providers: SendGrid for email, Expo for push, Twilio for SMS
   */
  async send(dto: SendNotificationDto) {
    const template = NOTIFICATION_TEMPLATES[dto.type];
    if (!template) {
      this.logger.warn(`Unknown notification type: ${dto.type}`);
      return { success: false, error: 'Unknown notification type' };
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, email: true, displayName: true, phone: true },
    });

    if (!user) {
      this.logger.warn(`User not found: ${dto.userId}`);
      return { success: false, error: 'User not found' };
    }

    // Interpolate template with data
    const title = this.interpolate(template.title, dto.data);
    const message = this.interpolate(template.message, dto.data);

    // Determine channels (default to email + in_app)
    const channels = dto.channels || [NotificationChannel.EMAIL, NotificationChannel.IN_APP];

    const results: Record<string, boolean> = {};

    // Send to each channel using REAL providers
    for (const channel of channels) {
      switch (channel) {
        case NotificationChannel.EMAIL:
          results.email = await this.sendEmailReal(user.email, title, message, dto.data);
          await this.logNotification(dto.userId, 'email', dto.type, title, message, results.email);
          break;

        case NotificationChannel.PUSH:
          results.push = await this.sendPushReal(dto.userId, title, message, dto.data);
          await this.logNotification(dto.userId, 'push', dto.type, title, message, results.push);
          break;

        case NotificationChannel.IN_APP:
          results.in_app = await this.saveInAppNotification(dto.userId, dto.type, title, message, dto.data);
          await this.logNotification(dto.userId, 'in_app', dto.type, title, message, results.in_app);
          break;

        case NotificationChannel.SMS:
          if (user.phone) {
            results.sms = await this.sendSmsReal(user.phone, message);
            await this.logNotification(dto.userId, 'sms', dto.type, title, message, results.sms);
          }
          break;
      }
    }

    this.logger.log(`Notification sent to ${user.email}: ${dto.type}`);

    return { success: true, channels: results };
  }

  /**
   * Send email using SendGrid provider
   */
  private async sendEmailReal(
    to: string,
    subject: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const result = await this.sendGridProvider.sendEmail({
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${subject}</h2>
            <p>${body}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Tarodan. Tüm hakları saklıdır.
            </p>
          </div>
        `,
      });

      return result.success;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send push notification using Expo provider
   */
  private async sendPushReal(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const results = await this.expoPushProvider.sendToUser(userId, title, body, data);
      return results.some((r) => r.success);
    } catch (error) {
      this.logger.error(`Failed to send push to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send SMS using Twilio provider
   */
  private async sendSmsReal(phone: string, message: string): Promise<boolean> {
    try {
      const result = await this.smsProvider.sendSms({
        to: phone,
        body: message,
      });
      return result.success;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}:`, error);
      return false;
    }
  }

  /**
   * Save in-app notification to database
   */
  private async saveInAppNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    try {
      // Store in NotificationLog as an in-app notification
      await this.prisma.notificationLog.create({
        data: {
          userId,
          channel: 'in_app',
          type,
          title,
          body: message,
          data: data || {},
          status: 'sent',
          sentAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to save in-app notification for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Log notification to database for tracking
   */
  private async logNotification(
    userId: string,
    channel: string,
    type: string,
    title: string,
    body: string,
    success: boolean,
  ): Promise<void> {
    try {
      await this.prisma.notificationLog.create({
        data: {
          userId,
          channel,
          type,
          title,
          body,
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : null,
          errorMessage: success ? null : 'Delivery failed',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log notification:`, error);
    }
  }

  /**
   * Register push token for a user
   */
  async registerPushToken(userId: string, dto: RegisterPushTokenDto) {
    try {
      await this.expoPushProvider.registerToken(
        userId,
        dto.token,
        dto.platform as 'ios' | 'android',
        dto.deviceId,
      );

      return { success: true, userId, platform: dto.platform };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Interpolate template with data
   */
  private interpolate(template: string, data?: Record<string, any>): string {
    if (!data) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Get user's in-app notifications
   */
  async getInAppNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where: { userId, channel: 'in_app' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notificationLog.count({
        where: { userId, channel: 'in_app' },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.notificationLog.updateMany({
        where: { id: notificationId, userId },
        data: { status: 'read' },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notificationLog.updateMany({
      where: { userId, channel: 'in_app', status: 'sent' },
      data: { status: 'read' },
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notificationLog.count({
      where: { userId, channel: 'in_app', status: 'sent' },
    });
  }

  // ==================== CONVENIENCE METHODS ====================

  /**
   * Send order notification
   */
  async notifyOrderCreated(buyerId: string, orderId: string, amount: number) {
    return this.send({
      userId: buyerId,
      type: NotificationType.ORDER_CREATED,
      data: { orderId, amount },
    });
  }

  async notifyOrderPaid(sellerId: string, orderId: string, amount: number) {
    return this.send({
      userId: sellerId,
      type: NotificationType.ORDER_PAID,
      data: { orderId, amount },
    });
  }

  async notifyOrderShipped(buyerId: string, orderId: string, trackingNumber: string) {
    return this.send({
      userId: buyerId,
      type: NotificationType.ORDER_SHIPPED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: { orderId, trackingNumber },
    });
  }

  /**
   * Send offer notification
   */
  async notifyOfferReceived(sellerId: string, productId: string, amount: number) {
    return this.send({
      userId: sellerId,
      type: NotificationType.OFFER_RECEIVED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: { productId, amount },
    });
  }

  async notifyOfferAccepted(buyerId: string, productId: string, amount: number) {
    return this.send({
      userId: buyerId,
      type: NotificationType.OFFER_ACCEPTED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: { productId, amount },
    });
  }

  /**
   * Send trade notifications
   */
  async notifyTradeReceived(receiverId: string, tradeId: string) {
    return this.send({
      userId: receiverId,
      type: NotificationType.TRADE_RECEIVED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: { tradeId },
    });
  }

  async notifyTradeAccepted(initiatorId: string, tradeId: string) {
    return this.send({
      userId: initiatorId,
      type: NotificationType.TRADE_ACCEPTED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP, NotificationChannel.SMS],
      data: { tradeId },
    });
  }

  async notifyTradeShipped(receiverId: string, tradeId: string, trackingNumber: string) {
    return this.send({
      userId: receiverId,
      type: NotificationType.TRADE_SHIPPED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: { tradeId, trackingNumber },
    });
  }

  async notifyTradeCompleted(userId: string, tradeId: string) {
    return this.send({
      userId,
      type: NotificationType.TRADE_COMPLETED,
      channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
      data: { tradeId },
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userId: string) {
    return this.send({
      userId,
      type: NotificationType.WELCOME,
      channels: [NotificationChannel.EMAIL],
    });
  }

  /**
   * Send password reset email using SendGrid directly
   */
  async sendPasswordResetEmail(userId: string, resetToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) return { success: false, error: 'User not found' };

    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    const result = await this.sendGridProvider.sendPasswordResetEmail(user.email, resetUrl);

    await this.logNotification(userId, 'email', 'password_reset', 'Şifre Sıfırlama', '', result.success);

    return result;
  }

  /**
   * Send email verification using SendGrid directly
   */
  async sendEmailVerification(userId: string, verificationToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) return { success: false, error: 'User not found' };

    const verifyUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`;
    const result = await this.sendGridProvider.sendEmailVerification(user.email, verifyUrl);

    await this.logNotification(userId, 'email', 'email_verification', 'E-posta Doğrulama', '', result.success);

    return result;
  }

  /**
   * Check if providers are configured
   */
  getProviderStatus() {
    return {
      sendgrid: this.sendGridProvider.isConfigured(),
      expo: this.expoPushProvider.isConfigured(),
      sms: this.smsProvider.isConfigured(),
    };
  }
}
