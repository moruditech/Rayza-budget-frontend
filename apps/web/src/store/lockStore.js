import { create } from 'zustand';
import {
  hashPin,
  randomSalt,
  safeEqual,
  lockoutSeconds,
  isValidPin,
  PBKDF2_ITERATIONS,
} from '../features/appLock/lockCrypto';

// App lock: a PIN (and optionally the phone's fingerprint / face unlock) that
// covers the app every time it is left and re-opened. Lives on this device
// only — the PIN is stored as a salted hash and is never sent anywhere.
const CONFIG_KEY = 'budget.appLock';
const ATTEMPTS_KEY = 'budget.appLockAttempts';

// Ignore "app hidden" events for a moment after unlocking: the phone's own
// fingerprint dialog can briefly hide the page and would re-lock straight away.
const UNLOCK_GRACE_MS = 1500;

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const initialConfig = read(CONFIG_KEY);

export const useLockStore = create((set, get) => ({
  // { salt, hash, iterations, pinLength, credentialId|null } — null = lock is off
  config: initialConfig,
  // Start locked whenever a lock exists, so opening the app always asks.
  locked: !!initialConfig,
  unlockedAt: 0,
  attempts: read(ATTEMPTS_KEY) ?? { count: 0, until: 0 },

  async enable(pin, credentialId = null) {
    if (!isValidPin(pin)) throw new Error('PIN must be 4 to 6 digits');
    const salt = randomSalt();
    const config = {
      salt,
      hash: await hashPin(pin, salt),
      iterations: PBKDF2_ITERATIONS,
      pinLength: pin.length,
      credentialId,
    };
    write(CONFIG_KEY, config);
    write(ATTEMPTS_KEY, null);
    set({ config, locked: false, unlockedAt: Date.now(), attempts: { count: 0, until: 0 } });
  },

  async changePin(pin) {
    const current = get().config;
    if (!current) return;
    if (!isValidPin(pin)) throw new Error('PIN must be 4 to 6 digits');
    const salt = randomSalt();
    const config = {
      ...current,
      salt,
      hash: await hashPin(pin, salt),
      iterations: PBKDF2_ITERATIONS,
      pinLength: pin.length,
    };
    write(CONFIG_KEY, config);
    set({ config });
  },

  setCredential(credentialId) {
    const current = get().config;
    if (!current) return;
    const config = { ...current, credentialId };
    write(CONFIG_KEY, config);
    set({ config });
  },

  disable() {
    write(CONFIG_KEY, null);
    write(ATTEMPTS_KEY, null);
    set({ config: null, locked: false, attempts: { count: 0, until: 0 } });
  },

  /**
   * Checks a PIN. Returns { ok: true } or
   * { ok: false, waitSeconds, triesLeft } — waitSeconds > 0 means the lock is
   * pausing attempts after too many wrong PINs.
   */
  async verifyPin(pin) {
    const { config, attempts } = get();
    if (!config) return { ok: true };

    const now = Date.now();
    if (attempts.until > now) {
      return { ok: false, waitSeconds: Math.ceil((attempts.until - now) / 1000), triesLeft: 0 };
    }

    const hash = await hashPin(pin, config.salt, config.iterations);
    if (safeEqual(hash, config.hash)) {
      write(ATTEMPTS_KEY, null);
      set({ attempts: { count: 0, until: 0 } });
      get().unlock();
      return { ok: true };
    }

    const count = attempts.count + 1;
    const wait = lockoutSeconds(count);
    const next = { count, until: wait ? Date.now() + wait * 1000 : 0 };
    write(ATTEMPTS_KEY, next);
    set({ attempts: next });
    return { ok: false, waitSeconds: wait, triesLeft: wait ? 0 : 5 - (count % 5) };
  },

  unlock() {
    set({ locked: false, unlockedAt: Date.now() });
  },

  // Called when the app is hidden (switched away, screen off).
  lockNow() {
    const { config, unlockedAt } = get();
    if (!config) return;
    if (Date.now() - unlockedAt < UNLOCK_GRACE_MS) return;
    set({ locked: true });
  },

  // Forget the lock completely (deliberate log out).
  reset() {
    write(CONFIG_KEY, null);
    write(ATTEMPTS_KEY, null);
    set({ config: null, locked: false, attempts: { count: 0, until: 0 } });
  },
}));
