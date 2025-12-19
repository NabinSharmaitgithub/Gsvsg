"use client";

// Helper to convert ArrayBuffer to URL-safe Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Use URL-safe characters
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper to convert URL-safe Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  // Pad with '=' characters
  let paddedBase64 = base64;
  while (paddedBase64.length % 4) {
    paddedBase64 += '=';
  }
  // Replace URL-safe characters with standard Base64 characters
  const binary_string = window.atob(paddedBase64.replace(/-/g, '+').replace(/_/g, '/'));
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return bufferToBase64(exported);
}

export async function importKey(keyData: string): Promise<CryptoKey> {
  const buffer = base64ToBuffer(keyData);
  return window.crypto.subtle.importKey(
    "raw",
    buffer,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(
  text: string,
  key: CryptoKey
): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  const ivAndCiphertext = new Uint8Array(iv.length + ciphertext.byteLength);
  ivAndCiphertext.set(iv);
  ivAndCiphertext.set(new Uint8Array(ciphertext), iv.length);
  return bufferToBase64(ivAndCiphertext.buffer);
}

export async function decryptMessage(
  encryptedData: string,
  key: CryptoKey
): Promise<string> {
  try {
    const ivAndCiphertext = base64ToBuffer(encryptedData);
    const iv = ivAndCiphertext.slice(0, 12);
    const ciphertext = ivAndCiphertext.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Failed to decrypt message.";
  }
}
