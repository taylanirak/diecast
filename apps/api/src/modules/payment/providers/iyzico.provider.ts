import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * iyzico Payment Provider
 * Implements iyzico API integration for Turkish market
 * 
 * Requirement: iyzico integration (project.md)
 * Currency: TRY only (project.md)
 */

export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface IyzicoPaymentRequest {
  locale: string;
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: string;
  installment: string;
  basketId: string;
  paymentChannel: string;
  paymentGroup: string;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    ip: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }>;
}

export interface IyzicoPaymentResponse {
  status: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  token?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
  paymentPageUrl?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
}

export interface IyzicoPaymentResult {
  status: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  price: number;
  paidPrice: number;
  installment: number;
  paymentId: string;
  fraudStatus: number;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionRateAmount: number;
  iyziCommissionFee: number;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  binNumber: string;
  lastFourDigits: string;
  currency: string;
  itemTransactions: Array<{
    itemId: string;
    paymentTransactionId: string;
    transactionStatus: number;
    price: number;
    paidPrice: number;
    merchantCommissionRate: number;
    merchantCommissionRateAmount: number;
    iyziCommissionRateAmount: number;
    iyziCommissionFee: number;
    blockageRate: number;
    blockageRateAmountMerchant: number;
    blockageRateAmountSubMerchant: number;
    blockageResolvedDate: string;
    subMerchantKey: string;
    subMerchantPrice: number;
    subMerchantPayoutRate: number;
    subMerchantPayoutAmount: number;
    merchantPayoutAmount: number;
  }>;
  authCode: string;
  phase: string;
  hostReference: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface IyzicoRefundRequest {
  locale: string;
  conversationId: string;
  paymentTransactionId: string;
  price: string;
  currency: string;
  ip: string;
}

export interface IyzicoRefundResponse {
  status: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  paymentId: string;
  paymentTransactionId: string;
  price: number;
  currency: string;
  errorCode?: string;
  errorMessage?: string;
}

@Injectable()
export class IyzicoProvider {
  private readonly logger = new Logger(IyzicoProvider.name);
  private readonly config: IyzicoConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get('IYZICO_API_KEY') || 'sandbox-apikey',
      secretKey: this.configService.get('IYZICO_SECRET_KEY') || 'sandbox-secretkey',
      baseUrl: this.configService.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com',
    };
  }

  /**
   * Generate authorization header for iyzico API
   */
  private generateAuthorizationHeader(request: any): string {
    const randomString = this.generateRandomString();
    const hashString = randomString + this.config.secretKey;
    const pkiString = this.generatePkiString(request);
    const hash = this.generateHash(hashString + pkiString);
    
    return `IYZWS ${this.config.apiKey}:${hash}`;
  }

  /**
   * Generate PKI string from request object
   */
  private generatePkiString(request: any): string {
    let pkiString = '[';
    for (const [key, value] of Object.entries(request)) {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            pkiString += `${key}=[`;
            for (const item of value) {
              pkiString += this.generatePkiString(item);
            }
            pkiString += '], ';
          } else {
            pkiString += `${key}=${this.generatePkiString(value)}, `;
          }
        } else {
          pkiString += `${key}=${value}, `;
        }
      }
    }
    pkiString = pkiString.replace(/, $/, '');
    pkiString += ']';
    return pkiString;
  }

  /**
   * Generate SHA256 hash
   */
  private generateHash(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('base64');
  }

  /**
   * Generate random string for authorization
   */
  private generateRandomString(): string {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  /**
   * Initialize checkout form (3DS payment)
   * Creates a hosted payment page on iyzico
   */
  async initializeCheckoutForm(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    const url = `${this.config.baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.generateAuthorizationHeader(request),
          'x-iyzi-rnd': this.generateRandomString(),
        },
        body: JSON.stringify(request),
      });

      const data = await response.json() as IyzicoPaymentResponse;
      
      this.logger.log(`iyzico checkout form initialized: ${data.status}, conversationId: ${request.conversationId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`iyzico checkout form initialization failed: ${error.message}`);
      return {
        status: 'failure',
        locale: request.locale,
        systemTime: Date.now(),
        conversationId: request.conversationId,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Retrieve checkout form result (after 3DS callback)
   */
  async retrieveCheckoutFormResult(token: string, conversationId: string): Promise<IyzicoPaymentResult> {
    const url = `${this.config.baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`;
    
    const request = {
      locale: 'tr',
      conversationId,
      token,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.generateAuthorizationHeader(request),
          'x-iyzi-rnd': this.generateRandomString(),
        },
        body: JSON.stringify(request),
      });

      const data = await response.json() as IyzicoPaymentResult;
      
      this.logger.log(`iyzico payment result retrieved: ${data.status}, paymentId: ${data.paymentId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`iyzico payment result retrieval failed: ${error.message}`);
      return {
        status: 'failure',
        locale: 'tr',
        systemTime: Date.now(),
        conversationId,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message,
      } as IyzicoPaymentResult;
    }
  }

  /**
   * Process refund
   */
  async refund(request: IyzicoRefundRequest): Promise<IyzicoRefundResponse> {
    const url = `${this.config.baseUrl}/payment/refund`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.generateAuthorizationHeader(request),
          'x-iyzi-rnd': this.generateRandomString(),
        },
        body: JSON.stringify(request),
      });

      const data = await response.json() as IyzicoRefundResponse;
      
      this.logger.log(`iyzico refund processed: ${data.status}, paymentId: ${data.paymentId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`iyzico refund failed: ${error.message}`);
      return {
        status: 'failure',
        locale: request.locale,
        systemTime: Date.now(),
        conversationId: request.conversationId,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message,
      } as IyzicoRefundResponse;
    }
  }

  /**
   * Build payment request from order data
   */
  buildPaymentRequest(params: {
    orderId: string;
    orderNumber: string;
    amount: number;
    buyer: {
      id: string;
      displayName: string;
      email: string;
    };
    shippingAddress: {
      city: string;
      addressLine1: string;
    };
    billingAddress: {
      city: string;
      addressLine1: string;
    };
    product: {
      id: string;
      title: string;
      categoryName: string;
    };
    callbackUrl: string;
    ip: string;
  }): IyzicoPaymentRequest {
    const [firstName, ...lastNameParts] = params.buyer.displayName.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    return {
      locale: 'tr',
      conversationId: params.orderId,
      price: params.amount.toFixed(2),
      paidPrice: params.amount.toFixed(2),
      currency: 'TRY',
      installment: '1',
      basketId: params.orderNumber,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl: params.callbackUrl,
      buyer: {
        id: params.buyer.id,
        name: firstName,
        surname: lastName,
        email: params.buyer.email,
        identityNumber: '11111111111', // TC Kimlik - can be collected if needed
        registrationAddress: params.billingAddress.addressLine1,
        city: params.billingAddress.city,
        country: 'Turkey',
        ip: params.ip,
      },
      shippingAddress: {
        contactName: params.buyer.displayName,
        city: params.shippingAddress.city,
        country: 'Turkey',
        address: params.shippingAddress.addressLine1,
      },
      billingAddress: {
        contactName: params.buyer.displayName,
        city: params.billingAddress.city,
        country: 'Turkey',
        address: params.billingAddress.addressLine1,
      },
      basketItems: [
        {
          id: params.product.id,
          name: params.product.title,
          category1: params.product.categoryName,
          itemType: 'PHYSICAL',
          price: params.amount.toFixed(2),
        },
      ],
    };
  }
}
