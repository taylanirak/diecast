/**
 * Authentication Email Templates
 * 
 * Templates for welcome, password reset, and email verification
 */

import { baseTemplate } from './base.template';

/**
 * Welcome Email Template
 */
export const welcomeTemplate = (data: { name: string; email: string }): string => {
  const content = `
    <h1>Tarodan'a Hoş Geldiniz! 🎉</h1>
    <p>Merhaba ${data.name},</p>
    <p>Diecast model araba koleksiyoncuları platformu Tarodan'a katıldığınız için çok mutluyuz!</p>
    
    <div class="info-box">
      <h2 style="margin-top: 0;">Neler Yapabilirsiniz?</h2>
      <ul style="color: #51545E; line-height: 2; padding-left: 20px;">
        <li>🚗 Koleksiyonunuzdaki ürünleri listeleyin ve satın</li>
        <li>🔄 Diğer koleksiyoncularla takas yapın</li>
        <li>💬 Topluluğumuzla iletişim kurun</li>
        <li>📦 Güvenli ödeme ve kargo ile alışveriş yapın</li>
        <li>⭐ Koleksiyonlar oluşturun ve paylaşın</li>
      </ul>
    </div>
    
    <div class="divider"></div>
    
    <h2>İlk Adımlar</h2>
    <p>Başlamak için şu adımları izleyin:</p>
    <ol style="color: #51545E; line-height: 2; padding-left: 20px;">
      <li>Profilinizi tamamlayın</li>
      <li>E-postanızı doğrulayın</li>
      <li>İlk ilanınızı oluşturun veya keşfetmeye başlayın</li>
    </ol>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://tarodan.com/profile" class="button">Profilimi Düzenle</a>
    </div>
    
    <div class="highlight">
      <p style="margin: 0;"><strong>💡 İpucu:</strong> Premium üyelik ile daha fazla ilan yayınlayabilir ve özel avantajlardan yararlanabilirsiniz.</p>
    </div>
    
    <p>Herhangi bir sorunuz olursa, yardım merkezimizi ziyaret edin veya <a href="mailto:destek@tarodan.com">destek@tarodan.com</a> adresinden bize ulaşın.</p>
    
    <p>Keyifli alışverişler!<br>
    <strong>Tarodan Ekibi</strong></p>
  `;

  return baseTemplate(content, { previewText: `Tarodan'a hoş geldiniz, ${data.name}!` });
};

/**
 * Email Verification Template
 */
export const emailVerificationTemplate = (data: { 
  name: string; 
  verificationUrl: string;
  expiresIn?: string;
}): string => {
  const content = `
    <h1>E-postanızı Doğrulayın ✉️</h1>
    <p>Merhaba ${data.name},</p>
    <p>Tarodan hesabınızı etkinleştirmek için e-posta adresinizi doğrulamanız gerekmektedir.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.verificationUrl}" class="button">E-postamı Doğrula</a>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; text-align: center;">
      Yukarıdaki buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:
    </p>
    <p style="font-size: 12px; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 4px;">
      ${data.verificationUrl}
    </p>
    
    <div class="highlight">
      <p style="margin: 0;">
        <strong>⏱️ Önemli:</strong> Bu link ${data.expiresIn || '24 saat'} içinde geçerliliğini yitirecektir.
      </p>
    </div>
    
    <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
  `;

  return baseTemplate(content, { previewText: 'E-posta adresinizi doğrulayın - Tarodan' });
};

/**
 * Password Reset Template
 */
export const passwordResetTemplate = (data: { 
  name: string; 
  resetUrl: string;
  expiresIn?: string;
}): string => {
  const content = `
    <h1>Şifre Sıfırlama 🔐</h1>
    <p>Merhaba ${data.name},</p>
    <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.resetUrl}" class="button">Şifremi Sıfırla</a>
    </div>
    
    <p style="color: #9ca3af; font-size: 14px; text-align: center;">
      Yukarıdaki buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayın:
    </p>
    <p style="font-size: 12px; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 4px;">
      ${data.resetUrl}
    </p>
    
    <div class="highlight">
      <p style="margin: 0;">
        <strong>⏱️ Önemli:</strong> Bu link ${data.expiresIn || '1 saat'} içinde geçerliliğini yitirecektir.
      </p>
    </div>
    
    <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 16px 0;">
      <p style="margin: 0; color: #b91c1c;">
        <strong>⚠️ Güvenlik Uyarısı:</strong> Eğer bu talebi siz yapmadıysanız, hesabınıza yetkisiz erişim girişimi olmuş olabilir. Lütfen bu e-postayı görmezden gelin ve şifrenizi değiştirmeyin.
      </p>
    </div>
    
    <p>Şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı güvenle silebilirsiniz.</p>
  `;

  return baseTemplate(content, { previewText: 'Şifre sıfırlama talebi - Tarodan' });
};

/**
 * Password Changed Notification Template
 */
export const passwordChangedTemplate = (data: { 
  name: string;
  changedAt: Date;
  ipAddress?: string;
}): string => {
  const content = `
    <h1>Şifreniz Değiştirildi ✅</h1>
    <p>Merhaba ${data.name},</p>
    <p>Tarodan hesabınızın şifresi başarıyla değiştirildi.</p>
    
    <div class="info-box">
      <p><strong>Değişiklik Zamanı:</strong> ${data.changedAt.toLocaleString('tr-TR')}</p>
      ${data.ipAddress ? `<p><strong>IP Adresi:</strong> ${data.ipAddress}</p>` : ''}
    </div>
    
    <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 16px 0;">
      <p style="margin: 0; color: #b91c1c;">
        <strong>⚠️ Bu siz değilseniz:</strong> Hesabınız tehlikede olabilir. Hemen şifrenizi sıfırlayın ve 
        <a href="mailto:guvenlik@tarodan.com" style="color: #b91c1c;">güvenlik ekibimizle</a> iletişime geçin.
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://tarodan.com/forgot-password" class="button button--secondary">Şifremi Sıfırla</a>
    </div>
    
    <p>Hesabınızı güvende tutmak için:</p>
    <ul style="color: #51545E; line-height: 1.8;">
      <li>Güçlü ve benzersiz şifreler kullanın</li>
      <li>İki faktörlü doğrulamayı etkinleştirin</li>
      <li>Şifrenizi başkalarıyla paylaşmayın</li>
    </ul>
  `;

  return baseTemplate(content, { previewText: 'Şifreniz değiştirildi - Tarodan' });
};

/**
 * 2FA Enabled Template
 */
export const twoFactorEnabledTemplate = (data: { name: string }): string => {
  const content = `
    <h1>2FA Etkinleştirildi 🔒</h1>
    <p>Merhaba ${data.name},</p>
    <p>İki faktörlü kimlik doğrulama (2FA) hesabınızda başarıyla etkinleştirildi.</p>
    
    <div class="info-box success-highlight">
      <p style="margin: 0;"><strong>✓ Hesabınız Artık Daha Güvende</strong></p>
    </div>
    
    <p>Bundan sonra giriş yaparken şifrenizin yanı sıra telefonunuzdaki doğrulama uygulamasından bir kod girmeniz gerekecek.</p>
    
    <div class="highlight">
      <p style="margin: 0;">
        <strong>💡 Önemli:</strong> Yedek kodlarınızı güvenli bir yere kaydettiğinizden emin olun. Telefonunuza erişiminizi kaybederseniz bu kodlara ihtiyacınız olacak.
      </p>
    </div>
    
    <p>Herhangi bir sorunuz varsa, <a href="mailto:destek@tarodan.com">destek@tarodan.com</a> adresinden bize ulaşabilirsiniz.</p>
  `;

  return baseTemplate(content, { previewText: '2FA etkinleştirildi - Hesabınız daha güvende' });
};
