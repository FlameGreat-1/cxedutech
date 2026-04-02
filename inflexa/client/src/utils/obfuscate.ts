/**
 * URL ID Obfuscation
 *
 * Transforms plain numeric IDs (e.g. 11) into opaque, URL-safe tokens
 * (e.g. "k3haPFJcWjzpH8Yxb0Kfm9RiTgEuZA2w") for use in public-facing URLs.
 *
 * This is cosmetic obfuscation — it hides sequential IDs from casual
 * observation but is NOT cryptographic security. Real access control
 * lives on the server.
 *
 * Algorithm:
 *   encode: id → XOR with salt → pack into 24 bytes with random noise → base64url
 *   decode: base64url → extract payload bytes at fixed positions → XOR with salt → id
 */

const SALT = 0x5a3c_e91f; // Fixed 32-bit XOR key

/**
 * Total token size in bytes. 24 bytes → 32 base64url characters.
 * Of these, only 5 bytes carry data (4 ID + 1 checksum).
 * The remaining 19 bytes are random noise.
 */
const TOKEN_BYTES = 24;

/**
 * Fixed positions within the 24-byte buffer where the real payload lives.
 * Chosen to scatter the data across the token so it's not clustered.
 *
 *   Position  3  → ID byte 0 (most significant)
 *   Position  7  → ID byte 1
 *   Position 13  → ID byte 2
 *   Position 19  → ID byte 3 (least significant)
 *   Position 22  → checksum (XOR of the 4 ID bytes)
 */
const POS_ID0 = 3;
const POS_ID1 = 7;
const POS_ID2 = 13;
const POS_ID3 = 19;
const POS_CHK = 22;

/**
 * Encode a numeric ID into an opaque URL-safe token (32 characters).
 */
export function encodeId(id: number): string {
  const scrambled = (id ^ SALT) >>> 0; // unsigned 32-bit

  // Fill entire buffer with random noise
  const buf = new Uint8Array(TOKEN_BYTES);
  for (let i = 0; i < TOKEN_BYTES; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }

  // Place the 4 scrambled ID bytes at their fixed positions
  buf[POS_ID0] = (scrambled >>> 24) & 0xff;
  buf[POS_ID1] = (scrambled >>> 16) & 0xff;
  buf[POS_ID2] = (scrambled >>> 8) & 0xff;
  buf[POS_ID3] = scrambled & 0xff;

  // Checksum: XOR of the 4 ID bytes
  buf[POS_CHK] = buf[POS_ID0] ^ buf[POS_ID1] ^ buf[POS_ID2] ^ buf[POS_ID3];

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
    if (binary.length !== TOKEN_BYTES) return null;

    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buf[i] = binary.charCodeAt(i);
    }

    // Extract the 4 ID bytes from their fixed positions
    const b0 = buf[POS_ID0];
    const b1 = buf[POS_ID1];
    const b2 = buf[POS_ID2];
    const b3 = buf[POS_ID3];

    // Verify checksum
    const checksum = b0 ^ b1 ^ b2 ^ b3;
    if (checksum !== buf[POS_CHK]) return null;

    // Reconstruct the scrambled value (big-endian)
    const scrambled = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
    const id = (scrambled ^ SALT) >>> 0;

    // Sanity: IDs should be positive integers within a reasonable range
    if (id === 0 || id > 0x7fff_ffff) return null;

    return id;
  } catch {
    return null;
  }
}
