// Вход по Face ID / отпечатку / коду телефона — системный запрос, приложение само биометрию не видит.

import * as LocalAuthentication from 'expo-local-authentication';

/** Есть ли чем защитить вход: биометрия или хотя бы код-пароль телефона */
export async function canProtectApp(): Promise<boolean> {
  try {
    return (await LocalAuthentication.getEnrolledLevelAsync()) !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** Системный запрос. Если лицо или палец не узнаны, телефон сам предложит код-пароль. */
export async function authenticate(promptMessage: string, cancelLabel: string): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel, disableDeviceFallback: false });
    return result.success;
  } catch {
    return false;
  }
}
