/**
 * URL ID Obfuscation
 *
 * Transforms plain numeric IDs (e.g. 11) into opaque, URL-safe tokens
 * (e.g. "eFx3kQ9m") for use in public-facing URLs.
 *
 * This is cosmetic obfuscation — it hides sequential IDs from casual
 * observation but is NOT cryptographic security. Real access control
 * lives on the server.
 *
 * Algorithm:
 *   encode: id → XOR with salt → pack into bytes with random noise → base64url
 *   decode: base64url → unpack bytes → XOR with same salt → id
 */

const SALT = 0x5a3c_e91f; // Fixed 32-bit XOR key

/**
 * Encode a numeric ID into an opaque URL-safe token.
 *
 * Layout (6 bytes):
 *   [0]    random noise byte (ignored on decode)
 *   [1-4]  XOR'd ID as 4 big-endian bytes
 *   [5]    simple checksum (XOR of bytes 1-4)
 */
export function encodeId(id: number): string {
  const scrambled = (id ^ SALT) >>> 0; // unsigned 32-bit

  const buf = new Uint8Array(6);
  buf[0] = Math.floor(Math.random() * 256);          // noise
  buf[1] = (scrambled >>> 24) & 0xff;
  buf[2] = (scrambled >>> 16) & 0xff;
  buf[3] = (scrambled >>> 8) & 0xff;
  buf[4] = scrambled & 0xff;
  buf[5] = buf[1] ^ buf[2] ^ buf[3] ^ buf[4];        // checksum

  // Base64url (RFC 4648 §5): + → -, / → _, strip padding
  const base64 = btoa(String.fromCharCode(...buf));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode an obfuscated URL token back to the original numeric ID.
 * Returns `null` if the token is malformed or the checksum fails.
 */
export function decodeId(token: string): number | null {
  try {
    // Restore standard base64
    let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    // Re-add padding
    while (b64.length % 4 !== 0) b64 += '=';

    const binary = atob(b64);
    if (binary.length !== 6) return null;

    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buf[i] = binary.charCodeAt(i);
    }

    // Verify checksum
    const checksum = buf[1] ^ buf[2] ^ buf[3] ^ buf[4];
    if (checksum !== buf[5]) return null;

    // Reconstruct the scrambled value (big-endian)
    const scrambled = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0;
    const id = (scrambled ^ SALT) >>> 0;

    // Sanity: IDs should be positive integers within a reasonable range
    if (id === 0 || id > 0x7fff_ffff) return null;

    return id;
  } catch {
    return null;
  }
}
