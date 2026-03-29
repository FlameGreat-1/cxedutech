import xss from 'xss';

export function sanitizeXss(value: string): string {
  if (typeof value !== 'string') return value;
  return xss(value);
}
