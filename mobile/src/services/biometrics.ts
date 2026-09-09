import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricAuthType = 'face' | 'fingerprint' | 'iris' | 'generic' | 'none';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricType: BiometricAuthType;
  biometricLabel: string;
}

/**
 * Checks device hardware support and user enrollment for Biometric Authentication (Face ID / Fingerprint)
 */
export async function getBiometricStatusAsync(): Promise<BiometricStatus> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return {
        hasHardware: false,
        isEnrolled: false,
        biometricType: 'none',
        biometricLabel: 'Biometrics Unavailable'
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType: BiometricAuthType = 'generic';
    let biometricLabel = 'Biometric Authentication';

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'face';
      biometricLabel = 'Face ID / Facial Recognition';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
      biometricLabel = 'Touch ID / Fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
      biometricLabel = 'Iris Recognition';
    }

    return {
      hasHardware: true,
      isEnrolled,
      biometricType,
      biometricLabel
    };
  } catch (error) {
    console.warn('[Biometrics] Error checking biometric status:', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      biometricType: 'none',
      biometricLabel: 'Biometrics Error'
    };
  }
}

/**
 * Prompts user for biometric authentication (Face ID / Touch ID / Android BiometricPrompt)
 */
export async function authenticateWithBiometricsAsync(
  promptMessage: string = 'Authorize with Face ID / Fingerprint'
): Promise<{ success: boolean; error?: string; warning?: string }> {
  try {
    const status = await getBiometricStatusAsync();

    if (!status.hasHardware) {
      return {
        success: false,
        error: 'Biometric hardware sensor is not available on this device.'
      };
    }

    if (!status.isEnrolled) {
      return {
        success: false,
        error: 'No biometrics (Face ID or Fingerprint) are enrolled in your device settings.'
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Account Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });

    if (result.success) {
      return { success: true };
    }

    if (result.error === 'user_cancel' || result.error === 'app_cancel' || result.error === 'system_cancel') {
      return { success: false, warning: 'Authentication cancelled.' };
    }

    return {
      success: false,
      error: result.warning || 'Biometric authentication did not match. Please try again.'
    };
  } catch (error: any) {
    console.error('[Biometrics] Authentication error:', error);
    return {
      success: false,
      error: error?.message || 'Biometric authentication failed.'
    };
  }
}
