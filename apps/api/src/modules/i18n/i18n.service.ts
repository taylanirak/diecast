// =============================================================================
// GAP-L03: INTERNATIONALIZATION SERVICE
// Multi-language support for the Tarodan Marketplace
// =============================================================================

import { Injectable, Logger } from '@nestjs/common';

// Supported languages
export type SupportedLanguage = 'tr' | 'en';

// Translation keys interface
export interface TranslationKeys {
  // Common
  'common.success': string;
  'common.error': string;
  'common.notFound': string;
  'common.unauthorized': string;
  'common.forbidden': string;
  'common.badRequest': string;
  'common.serverError': string;
  'common.validationError': string;
  
  // Auth
  'auth.loginSuccess': string;
  'auth.logoutSuccess': string;
  'auth.registerSuccess': string;
  'auth.invalidCredentials': string;
  'auth.emailNotVerified': string;
  'auth.accountDisabled': string;
  'auth.passwordResetSent': string;
  'auth.passwordResetSuccess': string;
  'auth.emailVerificationSent': string;
  'auth.emailVerified': string;
  'auth.invalidToken': string;
  'auth.tokenExpired': string;
  'auth.twoFactorRequired': string;
  'auth.twoFactorEnabled': string;
  'auth.twoFactorDisabled': string;
  'auth.invalidTwoFactorCode': string;
  
  // User
  'user.profileUpdated': string;
  'user.avatarUpdated': string;
  'user.notFound': string;
  'user.emailAlreadyExists': string;
  'user.phoneAlreadyExists': string;
  
  // Product
  'product.created': string;
  'product.updated': string;
  'product.deleted': string;
  'product.notFound': string;
  'product.alreadySold': string;
  'product.notActive': string;
  'product.listingLimitReached': string;
  'product.approvalPending': string;
  'product.approved': string;
  'product.rejected': string;
  
  // Offer
  'offer.created': string;
  'offer.accepted': string;
  'offer.rejected': string;
  'offer.countered': string;
  'offer.cancelled': string;
  'offer.expired': string;
  'offer.notFound': string;
  'offer.cannotOfferOwnProduct': string;
  'offer.existingPendingOffer': string;
  
  // Order
  'order.created': string;
  'order.paid': string;
  'order.shipped': string;
  'order.delivered': string;
  'order.completed': string;
  'order.cancelled': string;
  'order.refunded': string;
  'order.notFound': string;
  
  // Trade
  'trade.created': string;
  'trade.accepted': string;
  'trade.rejected': string;
  'trade.shipped': string;
  'trade.received': string;
  'trade.completed': string;
  'trade.cancelled': string;
  'trade.disputed': string;
  'trade.notFound': string;
  'trade.cannotTradeOwnProduct': string;
  'trade.tradingNotEnabled': string;
  'trade.responseDeadlineExpired': string;
  'trade.shippingDeadlineExpired': string;
  
  // Payment
  'payment.initiated': string;
  'payment.completed': string;
  'payment.failed': string;
  'payment.refunded': string;
  'payment.notFound': string;
  
  // Shipping
  'shipping.labelCreated': string;
  'shipping.shipped': string;
  'shipping.inTransit': string;
  'shipping.delivered': string;
  'shipping.returned': string;
  'shipping.trackingUpdated': string;
  
  // Rating
  'rating.created': string;
  'rating.updated': string;
  'rating.deleted': string;
  'rating.alreadyRated': string;
  
  // Collection
  'collection.created': string;
  'collection.updated': string;
  'collection.deleted': string;
  'collection.itemAdded': string;
  'collection.itemRemoved': string;
  'collection.notFound': string;
  
  // Wishlist
  'wishlist.itemAdded': string;
  'wishlist.itemRemoved': string;
  'wishlist.alreadyInWishlist': string;
  
  // Support
  'support.ticketCreated': string;
  'support.ticketUpdated': string;
  'support.ticketClosed': string;
  'support.messageSent': string;
  'support.notFound': string;
  
  // Membership
  'membership.upgraded': string;
  'membership.downgraded': string;
  'membership.cancelled': string;
  'membership.renewed': string;
  
  // Notification
  'notification.sent': string;
  'notification.markedAsRead': string;
  
  // Admin
  'admin.userBanned': string;
  'admin.userUnbanned': string;
  'admin.productApproved': string;
  'admin.productRejected': string;
  'admin.settingsUpdated': string;
  'admin.commissionRuleCreated': string;
  'admin.commissionRuleUpdated': string;
}

// Turkish translations
const TR_TRANSLATIONS: TranslationKeys = {
  // Common
  'common.success': 'İşlem başarılı',
  'common.error': 'Bir hata oluştu',
  'common.notFound': 'Bulunamadı',
  'common.unauthorized': 'Yetkilendirme gerekli',
  'common.forbidden': 'Bu işlem için yetkiniz yok',
  'common.badRequest': 'Geçersiz istek',
  'common.serverError': 'Sunucu hatası',
  'common.validationError': 'Doğrulama hatası',
  
  // Auth
  'auth.loginSuccess': 'Giriş başarılı',
  'auth.logoutSuccess': 'Çıkış başarılı',
  'auth.registerSuccess': 'Kayıt başarılı! E-posta adresinizi doğrulayın.',
  'auth.invalidCredentials': 'E-posta veya şifre hatalı',
  'auth.emailNotVerified': 'E-posta adresi doğrulanmamış',
  'auth.accountDisabled': 'Hesabınız devre dışı bırakılmış',
  'auth.passwordResetSent': 'Şifre sıfırlama bağlantısı gönderildi',
  'auth.passwordResetSuccess': 'Şifre başarıyla değiştirildi',
  'auth.emailVerificationSent': 'Doğrulama e-postası gönderildi',
  'auth.emailVerified': 'E-posta adresi doğrulandı',
  'auth.invalidToken': 'Geçersiz veya süresi dolmuş token',
  'auth.tokenExpired': 'Token süresi dolmuş',
  'auth.twoFactorRequired': 'İki faktörlü doğrulama gerekli',
  'auth.twoFactorEnabled': 'İki faktörlü doğrulama etkinleştirildi',
  'auth.twoFactorDisabled': 'İki faktörlü doğrulama devre dışı bırakıldı',
  'auth.invalidTwoFactorCode': 'Geçersiz doğrulama kodu',
  
  // User
  'user.profileUpdated': 'Profil güncellendi',
  'user.avatarUpdated': 'Profil fotoğrafı güncellendi',
  'user.notFound': 'Kullanıcı bulunamadı',
  'user.emailAlreadyExists': 'Bu e-posta adresi zaten kayıtlı',
  'user.phoneAlreadyExists': 'Bu telefon numarası zaten kayıtlı',
  
  // Product
  'product.created': 'İlan oluşturuldu',
  'product.updated': 'İlan güncellendi',
  'product.deleted': 'İlan silindi',
  'product.notFound': 'İlan bulunamadı',
  'product.alreadySold': 'Bu ürün zaten satılmış',
  'product.notActive': 'Bu ilan aktif değil',
  'product.listingLimitReached': 'İlan limitinize ulaştınız',
  'product.approvalPending': 'İlan onay bekliyor',
  'product.approved': 'İlan onaylandı',
  'product.rejected': 'İlan reddedildi',
  
  // Offer
  'offer.created': 'Teklif gönderildi',
  'offer.accepted': 'Teklif kabul edildi',
  'offer.rejected': 'Teklif reddedildi',
  'offer.countered': 'Karşı teklif gönderildi',
  'offer.cancelled': 'Teklif iptal edildi',
  'offer.expired': 'Teklif süresi doldu',
  'offer.notFound': 'Teklif bulunamadı',
  'offer.cannotOfferOwnProduct': 'Kendi ürününüze teklif veremezsiniz',
  'offer.existingPendingOffer': 'Bu ürün için bekleyen bir teklifiniz var',
  
  // Order
  'order.created': 'Sipariş oluşturuldu',
  'order.paid': 'Ödeme alındı',
  'order.shipped': 'Sipariş kargoya verildi',
  'order.delivered': 'Sipariş teslim edildi',
  'order.completed': 'Sipariş tamamlandı',
  'order.cancelled': 'Sipariş iptal edildi',
  'order.refunded': 'İade yapıldı',
  'order.notFound': 'Sipariş bulunamadı',
  
  // Trade
  'trade.created': 'Takas teklifi gönderildi',
  'trade.accepted': 'Takas kabul edildi',
  'trade.rejected': 'Takas reddedildi',
  'trade.shipped': 'Takas kargosu gönderildi',
  'trade.received': 'Takas teslim alındı',
  'trade.completed': 'Takas tamamlandı',
  'trade.cancelled': 'Takas iptal edildi',
  'trade.disputed': 'Takas itirazı oluşturuldu',
  'trade.notFound': 'Takas bulunamadı',
  'trade.cannotTradeOwnProduct': 'Kendi ürününüzle takas yapamazsınız',
  'trade.tradingNotEnabled': 'Bu ürün takasa kapalı',
  'trade.responseDeadlineExpired': 'Yanıt süresi doldu',
  'trade.shippingDeadlineExpired': 'Kargo süresi doldu',
  
  // Payment
  'payment.initiated': 'Ödeme başlatıldı',
  'payment.completed': 'Ödeme tamamlandı',
  'payment.failed': 'Ödeme başarısız',
  'payment.refunded': 'Ödeme iade edildi',
  'payment.notFound': 'Ödeme bulunamadı',
  
  // Shipping
  'shipping.labelCreated': 'Kargo etiketi oluşturuldu',
  'shipping.shipped': 'Kargo gönderildi',
  'shipping.inTransit': 'Kargo yolda',
  'shipping.delivered': 'Kargo teslim edildi',
  'shipping.returned': 'Kargo iade edildi',
  'shipping.trackingUpdated': 'Kargo takip bilgisi güncellendi',
  
  // Rating
  'rating.created': 'Değerlendirme eklendi',
  'rating.updated': 'Değerlendirme güncellendi',
  'rating.deleted': 'Değerlendirme silindi',
  'rating.alreadyRated': 'Bu işlem için zaten değerlendirme yaptınız',
  
  // Collection
  'collection.created': 'Koleksiyon oluşturuldu',
  'collection.updated': 'Koleksiyon güncellendi',
  'collection.deleted': 'Koleksiyon silindi',
  'collection.itemAdded': 'Koleksiyona eklendi',
  'collection.itemRemoved': 'Koleksiyondan çıkarıldı',
  'collection.notFound': 'Koleksiyon bulunamadı',
  
  // Wishlist
  'wishlist.itemAdded': 'Favorilere eklendi',
  'wishlist.itemRemoved': 'Favorilerden çıkarıldı',
  'wishlist.alreadyInWishlist': 'Bu ürün zaten favorilerinizde',
  
  // Support
  'support.ticketCreated': 'Destek talebi oluşturuldu',
  'support.ticketUpdated': 'Destek talebi güncellendi',
  'support.ticketClosed': 'Destek talebi kapatıldı',
  'support.messageSent': 'Mesaj gönderildi',
  'support.notFound': 'Destek talebi bulunamadı',
  
  // Membership
  'membership.upgraded': 'Üyelik yükseltildi',
  'membership.downgraded': 'Üyelik düşürüldü',
  'membership.cancelled': 'Üyelik iptal edildi',
  'membership.renewed': 'Üyelik yenilendi',
  
  // Notification
  'notification.sent': 'Bildirim gönderildi',
  'notification.markedAsRead': 'Bildirim okundu olarak işaretlendi',
  
  // Admin
  'admin.userBanned': 'Kullanıcı engellendi',
  'admin.userUnbanned': 'Kullanıcı engeli kaldırıldı',
  'admin.productApproved': 'Ürün onaylandı',
  'admin.productRejected': 'Ürün reddedildi',
  'admin.settingsUpdated': 'Ayarlar güncellendi',
  'admin.commissionRuleCreated': 'Komisyon kuralı oluşturuldu',
  'admin.commissionRuleUpdated': 'Komisyon kuralı güncellendi',
};

// English translations
const EN_TRANSLATIONS: TranslationKeys = {
  // Common
  'common.success': 'Operation successful',
  'common.error': 'An error occurred',
  'common.notFound': 'Not found',
  'common.unauthorized': 'Authorization required',
  'common.forbidden': 'You do not have permission for this action',
  'common.badRequest': 'Invalid request',
  'common.serverError': 'Server error',
  'common.validationError': 'Validation error',
  
  // Auth
  'auth.loginSuccess': 'Login successful',
  'auth.logoutSuccess': 'Logout successful',
  'auth.registerSuccess': 'Registration successful! Please verify your email.',
  'auth.invalidCredentials': 'Invalid email or password',
  'auth.emailNotVerified': 'Email address not verified',
  'auth.accountDisabled': 'Your account has been disabled',
  'auth.passwordResetSent': 'Password reset link sent',
  'auth.passwordResetSuccess': 'Password changed successfully',
  'auth.emailVerificationSent': 'Verification email sent',
  'auth.emailVerified': 'Email address verified',
  'auth.invalidToken': 'Invalid or expired token',
  'auth.tokenExpired': 'Token has expired',
  'auth.twoFactorRequired': 'Two-factor authentication required',
  'auth.twoFactorEnabled': 'Two-factor authentication enabled',
  'auth.twoFactorDisabled': 'Two-factor authentication disabled',
  'auth.invalidTwoFactorCode': 'Invalid verification code',
  
  // User
  'user.profileUpdated': 'Profile updated',
  'user.avatarUpdated': 'Profile photo updated',
  'user.notFound': 'User not found',
  'user.emailAlreadyExists': 'This email is already registered',
  'user.phoneAlreadyExists': 'This phone number is already registered',
  
  // Product
  'product.created': 'Listing created',
  'product.updated': 'Listing updated',
  'product.deleted': 'Listing deleted',
  'product.notFound': 'Listing not found',
  'product.alreadySold': 'This item has already been sold',
  'product.notActive': 'This listing is not active',
  'product.listingLimitReached': 'You have reached your listing limit',
  'product.approvalPending': 'Listing is pending approval',
  'product.approved': 'Listing approved',
  'product.rejected': 'Listing rejected',
  
  // Offer
  'offer.created': 'Offer sent',
  'offer.accepted': 'Offer accepted',
  'offer.rejected': 'Offer rejected',
  'offer.countered': 'Counter-offer sent',
  'offer.cancelled': 'Offer cancelled',
  'offer.expired': 'Offer expired',
  'offer.notFound': 'Offer not found',
  'offer.cannotOfferOwnProduct': 'You cannot make an offer on your own product',
  'offer.existingPendingOffer': 'You have a pending offer for this product',
  
  // Order
  'order.created': 'Order created',
  'order.paid': 'Payment received',
  'order.shipped': 'Order shipped',
  'order.delivered': 'Order delivered',
  'order.completed': 'Order completed',
  'order.cancelled': 'Order cancelled',
  'order.refunded': 'Refund processed',
  'order.notFound': 'Order not found',
  
  // Trade
  'trade.created': 'Trade offer sent',
  'trade.accepted': 'Trade accepted',
  'trade.rejected': 'Trade rejected',
  'trade.shipped': 'Trade shipment sent',
  'trade.received': 'Trade items received',
  'trade.completed': 'Trade completed',
  'trade.cancelled': 'Trade cancelled',
  'trade.disputed': 'Trade dispute created',
  'trade.notFound': 'Trade not found',
  'trade.cannotTradeOwnProduct': 'You cannot trade with your own product',
  'trade.tradingNotEnabled': 'This product is not available for trading',
  'trade.responseDeadlineExpired': 'Response deadline has expired',
  'trade.shippingDeadlineExpired': 'Shipping deadline has expired',
  
  // Payment
  'payment.initiated': 'Payment initiated',
  'payment.completed': 'Payment completed',
  'payment.failed': 'Payment failed',
  'payment.refunded': 'Payment refunded',
  'payment.notFound': 'Payment not found',
  
  // Shipping
  'shipping.labelCreated': 'Shipping label created',
  'shipping.shipped': 'Shipment sent',
  'shipping.inTransit': 'Shipment in transit',
  'shipping.delivered': 'Shipment delivered',
  'shipping.returned': 'Shipment returned',
  'shipping.trackingUpdated': 'Tracking information updated',
  
  // Rating
  'rating.created': 'Rating added',
  'rating.updated': 'Rating updated',
  'rating.deleted': 'Rating deleted',
  'rating.alreadyRated': 'You have already rated this transaction',
  
  // Collection
  'collection.created': 'Collection created',
  'collection.updated': 'Collection updated',
  'collection.deleted': 'Collection deleted',
  'collection.itemAdded': 'Added to collection',
  'collection.itemRemoved': 'Removed from collection',
  'collection.notFound': 'Collection not found',
  
  // Wishlist
  'wishlist.itemAdded': 'Added to favorites',
  'wishlist.itemRemoved': 'Removed from favorites',
  'wishlist.alreadyInWishlist': 'This item is already in your favorites',
  
  // Support
  'support.ticketCreated': 'Support ticket created',
  'support.ticketUpdated': 'Support ticket updated',
  'support.ticketClosed': 'Support ticket closed',
  'support.messageSent': 'Message sent',
  'support.notFound': 'Support ticket not found',
  
  // Membership
  'membership.upgraded': 'Membership upgraded',
  'membership.downgraded': 'Membership downgraded',
  'membership.cancelled': 'Membership cancelled',
  'membership.renewed': 'Membership renewed',
  
  // Notification
  'notification.sent': 'Notification sent',
  'notification.markedAsRead': 'Notification marked as read',
  
  // Admin
  'admin.userBanned': 'User banned',
  'admin.userUnbanned': 'User unbanned',
  'admin.productApproved': 'Product approved',
  'admin.productRejected': 'Product rejected',
  'admin.settingsUpdated': 'Settings updated',
  'admin.commissionRuleCreated': 'Commission rule created',
  'admin.commissionRuleUpdated': 'Commission rule updated',
};

// All translations
const TRANSLATIONS: Record<SupportedLanguage, TranslationKeys> = {
  tr: TR_TRANSLATIONS,
  en: EN_TRANSLATIONS,
};

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);
  private readonly defaultLanguage: SupportedLanguage = 'tr';
  private readonly supportedLanguages: SupportedLanguage[] = ['tr', 'en'];

  /**
   * Get translation for a key
   */
  translate(
    key: keyof TranslationKeys,
    language?: SupportedLanguage,
    params?: Record<string, string | number>,
  ): string {
    const lang = this.validateLanguage(language);
    let translation = TRANSLATIONS[lang][key];

    if (!translation) {
      this.logger.warn(`Translation key "${key}" not found for language "${lang}"`);
      translation = TRANSLATIONS[this.defaultLanguage][key] || key;
    }

    // Replace params in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      });
    }

    return translation;
  }

  /**
   * Shorthand for translate
   */
  t(
    key: keyof TranslationKeys,
    language?: SupportedLanguage,
    params?: Record<string, string | number>,
  ): string {
    return this.translate(key, language, params);
  }

  /**
   * Get all translations for a language
   */
  getAllTranslations(language?: SupportedLanguage): TranslationKeys {
    const lang = this.validateLanguage(language);
    return TRANSLATIONS[lang];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  /**
   * Get default language
   */
  getDefaultLanguage(): SupportedLanguage {
    return this.defaultLanguage;
  }

  /**
   * Validate and return a supported language
   */
  validateLanguage(language?: string): SupportedLanguage {
    if (!language) return this.defaultLanguage;
    
    const normalizedLang = language.toLowerCase().substring(0, 2) as SupportedLanguage;
    
    if (this.supportedLanguages.includes(normalizedLang)) {
      return normalizedLang;
    }
    
    return this.defaultLanguage;
  }

  /**
   * Parse Accept-Language header
   */
  parseAcceptLanguage(acceptLanguage?: string): SupportedLanguage {
    if (!acceptLanguage) return this.defaultLanguage;

    // Parse Accept-Language header (e.g., "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7")
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [code, qValue] = lang.trim().split(';q=');
        return {
          code: code.split('-')[0].toLowerCase(),
          quality: qValue ? parseFloat(qValue) : 1,
        };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { code } of languages) {
      if (this.supportedLanguages.includes(code as SupportedLanguage)) {
        return code as SupportedLanguage;
      }
    }

    return this.defaultLanguage;
  }
}
