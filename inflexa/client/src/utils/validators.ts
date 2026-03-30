export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Must be at least 8 characters.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain an uppercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain a number.');
  }

  return { valid: errors.length === 0, errors };
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidPostalCode(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 20;
}
