import * as FileSystem from 'expo-file-system/legacy';
import { User } from '../types';

export interface BiometricVaultSession {
  email: string;
  token: string;
  refreshToken?: string;
  user: User;
  savedAt: number;
}

const VAULT_FILE_NAME = '.heron_biometric_vault.dat';

function getVaultPath(): string | null {
  if (!FileSystem.documentDirectory) return null;
  return `${FileSystem.documentDirectory}${VAULT_FILE_NAME}`;
}

// Encode payload to base64 for obfuscation on disk
function encodeVaultData(data: BiometricVaultSession): string {
  try {
    const jsonStr = JSON.stringify(data);
    // Use global btoa or standard base64 encoding
    if (typeof btoa === 'function') {
      return btoa(unescape(encodeURIComponent(jsonStr)));
    }
    // Fallback: standard json string
    return jsonStr;
  } catch (err) {
    return JSON.stringify(data);
  }
}

// Decode payload from base64
function decodeVaultData(raw: string): BiometricVaultSession | null {
  try {
    let jsonStr = raw;
    if (typeof atob === 'function') {
      try {
        jsonStr = decodeURIComponent(escape(atob(raw)));
      } catch {
        // If not base64 encoded, use raw
        jsonStr = raw;
      }
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed.email === 'string' && typeof parsed.token === 'string') {
      return parsed as BiometricVaultSession;
    }
    return null;
  } catch (err) {
    console.warn('[BiometricVault] Error decoding vault data:', err);
    return null;
  }
}

/**
 * Checks whether an authorized biometric session vault exists on device
 */
export async function hasBiometricVault(): Promise<boolean> {
  try {
    const path = getVaultPath();
    if (!path) return false;
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  } catch (err) {
    console.warn('[BiometricVault] Check error:', err);
    return false;
  }
}

/**
 * Saves or updates the biometric session credentials
 */
export async function saveBiometricVault(data: {
  email: string;
  token: string;
  refreshToken?: string;
  user: User;
}): Promise<boolean> {
  try {
    const path = getVaultPath();
    if (!path) return false;

    const session: BiometricVaultSession = {
      email: data.email.toLowerCase().trim(),
      token: data.token,
      refreshToken: data.refreshToken,
      user: data.user,
      savedAt: Date.now(),
    };

    const encoded = encodeVaultData(session);
    await FileSystem.writeAsStringAsync(path, encoded, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return true;
  } catch (err) {
    console.error('[BiometricVault] Save error:', err);
    return false;
  }
}

/**
 * Retrieves the saved biometric session
 */
export async function getBiometricVault(): Promise<BiometricVaultSession | null> {
  try {
    const path = getVaultPath();
    if (!path) return null;

    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;

    const raw = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return decodeVaultData(raw);
  } catch (err) {
    console.error('[BiometricVault] Read error:', err);
    return null;
  }
}

/**
 * Clears the stored biometric session
 */
export async function clearBiometricVault(): Promise<boolean> {
  try {
    const path = getVaultPath();
    if (!path) return false;

    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path, { idempotent: true });
    }
    return true;
  } catch (err) {
    console.warn('[BiometricVault] Clear error:', err);
    return false;
  }
}

/**
 * Returns the email of the linked biometric account without exposing the session token
 */
export async function getStoredBiometricEmail(): Promise<string | null> {
  try {
    const session = await getBiometricVault();
    return session?.email || null;
  } catch {
    return null;
  }
}
