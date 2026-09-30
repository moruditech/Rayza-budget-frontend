import { toB64, fromB64 } from './lockCrypto';

// Fingerprint / face unlock through the phone's own screen-lock security
// (WebAuthn "platform authenticator"). The phone does the checking; the app
// only learns "yes, the owner just unlocked this phone". It works as a local
// gate for this device — nothing is verified by a server.

export async function biometricSupported() {
  try {
    return (
      !!window.PublicKeyCredential &&
      (await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    return false;
  }
}

const challenge = () => crypto.getRandomValues(new Uint8Array(32));

/** Asks the phone to create a unlock key. Must be called from a tap. Returns the key id. */
export async function registerBiometric() {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: challenge(),
      rp: { name: 'Budget', id: window.location.hostname },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: 'budget-app-lock',
        displayName: 'Budget app lock',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'discouraged',
      },
      attestation: 'none',
      timeout: 60_000,
    },
  });
  return toB64(credential.rawId);
}

/** Shows the phone's fingerprint / face prompt. Resolves true when the owner passes it. */
export async function verifyBiometric(credentialIdB64) {
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: challenge(),
        rpId: window.location.hostname,
        allowCredentials: [{ type: 'public-key', id: fromB64(credentialIdB64) }],
        userVerification: 'required',
        timeout: 60_000,
      },
    });
    return !!assertion;
  } catch {
    return false; // cancelled, failed, or not available
  }
}
