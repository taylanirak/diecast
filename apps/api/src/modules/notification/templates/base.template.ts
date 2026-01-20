/**
 * Base Email Template
 * 
 * Provides the HTML wrapper for all email templates
 * All templates extend from this base layout
 */

export const baseTemplate = (content: string, options?: { previewText?: string }) => `
<!DOCTYPE html>
<html lang="tr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>Tarodan</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f4f4f7; }
    table { border-collapse: collapse; }
    td { vertical-align: top; }
    img { border: 0; line-height: 100%; max-width: 100%; vertical-align: middle; }
    .email-wrapper { background-color: #f4f4f7; width: 100%; }
    .email-content { width: 100%; max-width: 600px; margin: 0 auto; }
    .email-body { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .email-body_inner { padding: 48px; }
    .content-cell { padding: 32px; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }
    h1 { color: #1a1a2e; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 28px; font-weight: bold; margin: 0 0 16px; }
    h2 { color: #1a1a2e; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 20px; font-weight: bold; margin: 0 0 12px; }
    p { color: #51545E; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
    .button { background-color: #e94560; border-radius: 8px; color: #ffffff !important; display: inline-block; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; padding: 14px 32px; text-decoration: none; text-align: center; }
    .button--secondary { background-color: #1a1a2e; }
    .button--success { background-color: #22c55e; }
    .footer { padding: 32px; text-align: center; }
    .footer p { color: #9ca3af; font-size: 12px; margin-bottom: 8px; }
    .footer a { color: #e94560; text-decoration: none; }
    .logo { margin-bottom: 24px; }
    .logo img { height: 40px; }
    .logo-text { color: #e94560; font-size: 24px; font-weight: bold; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; }
    .logo-text span { color: #1a1a2e; }
    .info-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 16px 0; }
    .info-box p { margin-bottom: 8px; }
    .info-box p:last-child { margin-bottom: 0; }
    .order-item { display: flex; border-bottom: 1px solid #e5e7eb; padding: 16px 0; }
    .order-item img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; }
    .order-item-details { margin-left: 16px; }
    .price { color: #e94560; font-weight: bold; font-size: 18px; }
    .divider { border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .highlight { background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 16px 0; }
    .success-highlight { background-color: #dcfce7; border-left-color: #22c55e; }
    .tracking-number { background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 16px 0; }
    @media (max-width: 600px) {
      .email-body_inner { padding: 24px !important; }
      .content-cell { padding: 16px !important; }
      h1 { font-size: 24px !important; }
    }
  </style>
</head>
<body>
  ${options?.previewText ? `<span class="preheader">${options.previewText}</span>` : ''}
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Header -->
          <tr>
            <td class="email-body" style="padding: 32px;">
              <div class="logo" style="text-align: center;">
                <span class="logo-text">Taro<span>dan</span></span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="email-body" style="margin-top: 8px;">
              <div class="email-body_inner">
                ${content}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tarodan. Tüm hakları saklıdır.</p>
                <p>
                  <a href="{{unsubscribe_url}}">E-posta tercihlerini yönet</a> · 
                  <a href="https://tarodan.com/help">Yardım Merkezi</a> · 
                  <a href="https://tarodan.com/privacy">Gizlilik Politikası</a>
                </p>
                <p style="margin-top: 16px; color: #d1d5db;">
                  Bu e-posta otomatik olarak gönderilmiştir.<br>
                  Lütfen bu e-postaya yanıt vermeyiniz.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
