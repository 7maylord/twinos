import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  // No NODE_ENV-based dev fallback: NODE_ENV isn't reliably 'production' on every
  // deployment target, so gating on it can silently fall through to a hardcoded,
  // source-committed key in a real deployment. Require the real secret always;
  // local/demo dev sets INTEGRATION_ENCRYPTION_KEY in .env like any other key.
  const secret = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      'INTEGRATION_ENCRYPTION_KEY is not set. Add it to your .env — refusing to encrypt integration credentials with a key committed to source.'
    );
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
