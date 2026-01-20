/**
 * SMS Provider (Twilio)
 * GAP-014: Real Notification Providers (Expo, SendGrid, SMS)
 *
 * Requirement: SMS notifications for critical alerts (project.md)
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsOptions {
  to: string; // Phone number in E.164 format (+905551234567)
  body: string;
  from?: string; // Sender ID or phone number
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID', '');
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN', '');
    this.fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER', '');
    this.enabled = !!this.accountSid && !!this.authToken && !!this.fromNumber;

    if (!this.enabled) {
      this.logger.warn('Twilio SMS is not configured. SMS notifications will be logged only.');
    }
  }

  /**
   * Validate phone number format (E.164)
   */
  isValidPhoneNumber(phone: string): boolean {
    // E.164 format: +[country code][number]
    // Turkish numbers: +90 5XX XXX XX XX
    return /^\+[1-9]\d{1,14}$/.test(phone);
  }

  /**
   * Format Turkish phone number to E.164
   */
  formatTurkishNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Handle various Turkish formats
    if (digits.startsWith('90') && digits.length === 12) {
      return `+${digits}`;
    }
    if (digits.startsWith('0') && digits.length === 11) {
      return `+9${digits}`;
    }
    if (digits.length === 10 && digits.startsWith('5')) {
      return `+90${digits}`;
    }

    // Return as-is if already in E.164 or unknown format
    return phone.startsWith('+') ? phone : `+${digits}`;
  }

  /**
   * Send SMS via Twilio
   */
  async sendSms(options: SmsOptions): Promise<SmsResult> {
    const formattedNumber = this.formatTurkishNumber(options.to);

    if (!this.isValidPhoneNumber(formattedNumber)) {
      this.logger.warn(`Invalid phone number format: ${options.to}`);
      return { success: false, error: 'Invalid phone number format' };
    }

    if (!this.enabled) {
      this.logger.log(`[SMS-MOCK] To: ${formattedNumber}, Body: ${options.body.substring(0, 50)}...`);
      return { success: true, messageId: `mock-sms-${Date.now()}` };
    }

    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const body = new URLSearchParams({
        To: formattedNumber,
        From: options.from || this.fromNumber,
        Body: options.body,
      });

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const result = await response.json();

      if (!response.ok) {
        this.logger.error(`Twilio SMS error: ${result.message || response.status}`);
        return { success: false, error: result.message || `Twilio error: ${response.status}` };
      }

      this.logger.log(`SMS sent via Twilio to ${formattedNumber}, SID: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send SMS via Twilio: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send OTP (One-Time Password) SMS
   */
  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      body: `Tarodan doğrulama kodunuz: ${otp}. Bu kod 5 dakika geçerlidir.`,
    });
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedSms(
    phone: string,
    orderId: string,
    trackingNumber: string,
  ): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      body: `Tarodan: Siparişiniz (#${orderId.slice(-8)}) kargoya verildi. Takip: ${trackingNumber}`,
    });
  }

  /**
   * Send trade status update
   */
  async sendTradeStatusSms(phone: string, tradeId: string, status: string): Promise<SmsResult> {
    let message: string;

    switch (status) {
      case 'accepted':
        message = `Takas teklifiniz (#${tradeId.slice(-8)}) kabul edildi! Lütfen kargoya verin.`;
        break;
      case 'shipped':
        message = `Takas (#${tradeId.slice(-8)}) kargoya verildi. Karşı taraf bekliyor.`;
        break;
      case 'delivered':
        message = `Takas paketiniz (#${tradeId.slice(-8)}) teslim edildi. Lütfen onaylayın.`;
        break;
      case 'completed':
        message = `Takas (#${tradeId.slice(-8)}) başarıyla tamamlandı!`;
        break;
      default:
        message = `Takas durumunuz (#${tradeId.slice(-8)}) güncellendi: ${status}`;
    }

    return this.sendSms({
      to: phone,
      body: message,
    });
  }

  /**
   * Send payment received notification
   */
  async sendPaymentReceivedSms(phone: string, amount: number): Promise<SmsResult> {
    return this.sendSms({
      to: phone,
      body: `Tarodan: ${amount.toFixed(2)} TL ödeme aldınız! Hesabınıza aktarılacak.`,
    });
  }

  /**
   * Send bulk SMS (for admin announcements, etc.)
   */
  async sendBulkSms(
    recipients: Array<{ phone: string; body: string }>,
  ): Promise<SmsResult[]> {
    const results: SmsResult[] = [];

    // Send sequentially with rate limiting
    for (const recipient of recipients) {
      const result = await this.sendSms({
        to: recipient.phone,
        body: recipient.body,
      });
      results.push(result);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Check if SMS provider is properly configured
   */
  isConfigured(): boolean {
    return this.enabled;
  }
}
