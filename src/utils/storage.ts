import AsyncStorage from '@react-native-async-storage/async-storage';

export const ACCESS_TOKEN_KEY = 'tripfusion_access_token';
export const USER_KEY = 'tripfusion_user';

export async function saveAccessToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // storage unavailable
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveUser(user: object): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage unavailable
  }
}

export async function getUser(): Promise<object | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as object;
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, USER_KEY]);
  } catch {
    // storage unavailable
  }
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }

  throw new Error('Base64 decode unavailable');
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(decodeBase64Url(parts[1])) as { exp?: number };
    if (typeof payload.exp !== 'number') return true;

    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
