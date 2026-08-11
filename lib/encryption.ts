import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Dev-only fallback so local/demo mode works without extra setup. Never used in
// production — see the throw below.
const DEV_DEFAULT_KEY = 'twinos-secret-dev-encryption-key-32bytes';

function getEncryptionKey(): Buffer {
  const secret = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'INTEGRATION_ENCRYPTION_KEY is not set. Refusing to encrypt integration credentials with a key committed to source in production.'
      );
    }
    return crypto.scryptSync(DEV_DEFAULT_KEY, 'salt-twinos', 32);
  }
  return crypto.scryptSync(secret, 'salt-twinos', 32);
}

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    console.log(`[Encryption] Starting encryption of text (length: ${text.length})`);
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag().toString('hex');
    console.log('[Encryption] Encryption completed successfully. Cipher format: iv:tag:encrypted');
    
    // Store format: iv:tag:encrypted
    return `${iv.toString('hex')}:${tag}:${encrypted}`;
  } catch (err) {
    console.error('[Encryption] Encryption error:', err);
    throw err;
  }
}

export function decrypt(cipherText: string): string {
  if (!cipherText) return cipherText;
  try {
    const parts = cipherText.split(':');
    console.log(`[Encryption] Decrypting ciphertext (parts length: ${parts.length})`);
    if (parts.length !== 3) {
      console.log('[Encryption] Ciphertext does not match expected format iv:tag:encrypted, returning as plain text.');
      return cipherText;
    }
    
    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log('[Encryption] Decryption completed successfully.');
    return decrypted;
  } catch (err) {
    console.error('[Encryption] Decryption error:', err);
    return cipherText;
  }
}
