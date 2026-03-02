// HKID validation
export const validateHKID = (hkid) => {
  // Remove spaces and convert to uppercase
  const cleanHKID = hkid.replace(/\s/g, '').toUpperCase();
  
  // HKID format: A123456(7) or AB123456(7)
  // Pattern: 1-2 letters, 6 digits, 1 check digit in parentheses (0-9 or A)
  const pattern = /^([A-Z]{1,2})(\d{6})\((\d|A)\)$/;
  const match = cleanHKID.match(pattern);
  
  if (!match) {
    return {
      valid: false,
      message: 'Invalid HKID format. Expected format: A123456(7) or AB123456(A)'
    };
  }
  
  const [, letters, digits, checkDigit] = match;
  
  // Calculate check digit
  const letterValues = {
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17,
    'I': 18, 'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, 'O': 24, 'P': 25,
    'Q': 26, 'R': 27, 'S': 28, 'T': 29, 'U': 30, 'V': 31, 'W': 32, 'X': 33,
    'Y': 34, 'Z': 35
  };
  
  let sum = 0;
  
  if (letters.length === 1) {
    sum += 36 * 9; // First position weight
    sum += letterValues[letters[0]] * 8;
  } else {
    sum += letterValues[letters[0]] * 9;
    sum += letterValues[letters[1]] * 8;
  }
  
  for (let i = 0; i < 6; i++) {
    sum += parseInt(digits[i]) * (7 - i);
  }
  
  const remainder = sum % 11;
  const calculatedCheckDigit = remainder === 0 ? '0' : (11 - remainder).toString();
  const expectedCheckDigit = calculatedCheckDigit === '10' ? 'A' : calculatedCheckDigit;
  
  if (checkDigit !== expectedCheckDigit && !(checkDigit === 'A' && expectedCheckDigit === '10')) {
    return {
      valid: false,
      message: `Invalid check digit. Expected: ${expectedCheckDigit}`
    };
  }
  
  return {
    valid: true,
    message: 'Valid HKID'
  };
};

// Email validation
export const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

// Credit card number validation (Luhn algorithm)
export const validateCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Expiry date validation
export const validateExpiryDate = (expiry) => {
  const pattern = /^(0[1-9]|1[0-2])\/(\d{2})$/;
  const match = expiry.match(pattern);
  
  if (!match) {
    return false;
  }
  
  const month = parseInt(match[1]);
  const year = parseInt('20' + match[2]);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

// Passport validation (basic)
export const validatePassport = (passport) => {
  // Basic validation: alphanumeric, 6-9 characters
  const pattern = /^[A-Z0-9]{6,9}$/;
  return pattern.test(passport.toUpperCase());
};

// Format credit card number for display
export const formatCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Format expiry date
export const formatExpiryDate = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};
