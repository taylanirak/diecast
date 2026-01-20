/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Turkish phone number validation
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Turkish numbers: 10 digits starting with 5 or 11 digits starting with 05
  return (
    (cleaned.length === 10 && cleaned.startsWith('5')) ||
    (cleaned.length === 11 && cleaned.startsWith('05'))
  );
}

/**
 * Password strength validation
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Turkish TC Kimlik No validation
 */
export function isValidTCKN(tckn: string): boolean {
  if (!/^[0-9]{11}$/.test(tckn)) return false;
  if (tckn[0] === '0') return false;

  const digits = tckn.split('').map(Number);
  const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];

  const check10 = ((sum1 * 7) - sum2) % 10;
  if (check10 !== digits[9]) return false;

  const check11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
  if (check11 !== digits[10]) return false;

  return true;
}

/**
 * IBAN validation (Turkish format)
 */
export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (!/^TR[0-9]{24}$/.test(cleaned)) return false;

  // Move first 4 chars to end and convert letters to numbers
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const converted = rearranged
    .split('')
    .map((char) => (char >= 'A' ? (char.charCodeAt(0) - 55).toString() : char))
    .join('');

  // Mod 97 check
  let remainder = converted;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
  }

  return parseInt(remainder, 10) % 97 === 1;
}

/**
 * Credit card number validation (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * URL validation
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Price validation (positive number with max 2 decimals)
 */
export function isValidPrice(price: number): boolean {
  return price > 0 && Number.isFinite(price) && Math.round(price * 100) === price * 100;
}
