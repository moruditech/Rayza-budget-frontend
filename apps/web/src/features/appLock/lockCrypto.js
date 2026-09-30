// PIN hashing for the app lock. The PIN never leaves the phone and is never
// stored as typed: only a salted PBKDF2 hash is kept.

const enc = new TextEncoder();
export const PBKDF2_ITERATIONS = 200_000;

export const toB64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
export const fromB64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

export const isValidPin = (pin) => /^\d{4,6}$/.test(pin);

export function randomSalt() {
  return toB64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPin(pin, saltB64, iterations = PBKDF2_ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(saltB64), iterations },
    key,
    256
  );
  return toB64(bits);
}

// Compares without stopping at the first difference.
export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Pause after repeated wrong PINs: nothing for the first 4, then 30 s after the
 * 5th, 60 s after the 10th, 120 s after the 15th ... up to 15 minutes.
 */
export function lockoutSeconds(failedCount) {
  if (failedCount < 5 || failedCount % 5 !== 0) return 0;
  return Math.min(30 * 2 ** (failedCount / 5 - 1), 900);
}
