// Fallout Shelter save file encryption/decryption
// AES-256-CBC with fixed key and IV

const KEY_HEX = 'A7CA9F3366D892C2F0BEF417341CA971B69AE9F7BACCCFFCF43C62D1D7D021F9';
const IV_HEX = '7475383967656A693334307438397532';

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function getKey(): Promise<CryptoKey> {
  const keyBuffer = hexToBytes(KEY_HEX);
  return crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
}

export async function decryptSave(base64Data: string): Promise<string> {
  const key = await getKey();
  const iv = hexToBytes(IV_HEX);
  const encryptedData = base64ToArrayBuffer(base64Data.trim());

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encryptedData
  );

  return new TextDecoder().decode(decryptedBuffer);
}

export async function encryptSave(jsonString: string): Promise<string> {
  const key = await getKey();
  const iv = hexToBytes(IV_HEX);
  const data = new TextEncoder().encode(jsonString);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data
  );

  return arrayBufferToBase64(encryptedBuffer);
}
