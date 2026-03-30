import xss from 'xss';

// Strip ALL HTML tags - no whitelist. This prevents img, iframe, svg XSS vectors.
const xssOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

export function sanitizeXss(value: string): string {
  if (typeof value !== 'string') return value;
  return xss(value, xssOptions);
}
