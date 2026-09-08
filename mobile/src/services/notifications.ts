import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Robust, dynamic detection for Expo Go (Store Client) across Android and iOS.
 * Remote push notifications functionality was removed from Expo Go in SDK 53+.
 */
export function isExpoGo(): boolean {
  try {
    const env = Constants?.executionEnvironment;
    const ownership = (Constants as any)?.appOwnership;
    const expoVersion = Constants?.expoVersion;
    const hasExpoClient = Boolean(
      (Constants as any)?.manifest2?.extra?.expoClient ||
      (Constants as any)?.manifest?.developer
    );

    const envStr = String(env || '');
    return Boolean(
      envStr === 'storeClient' ||
      ownership === 'expo' ||
      Boolean(expoVersion) ||
      hasExpoClient ||
      (typeof __DEV__ !== 'undefined' && __DEV__ && (ownership === 'expo' || Boolean(expoVersion) || (envStr !== 'bare' && envStr !== 'standalone')))
    );
  } catch {
    return true; // Fail safe to true to prevent fatal crashes
  }
}

export interface PushRegistrationResult {
  token: string | null;
  status: 'granted' | 'denied' | 'undetermined' | 'simulator' | 'error';
  error?: string;
}

/**
 * Lazily configure notification handler for Standalone / EAS builds.
 * Completely bypassed in Expo Go to prevent SDK 53+ runtime exceptions.
 */
export function initNotificationHandler() {
  if (isExpoGo()) return;

  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    });
  } catch (err) {
    console.log('[Push] Notification handler notice:', err);
  }
}

/**
 * Register this device for Expo / APNs / FCM Push Notifications.
 * Returns the Expo Push Token if permission is granted on a physical device in a Standalone/Dev build.
 * Gracefully bypasses in Expo Go where remote push was deprecated in SDK 53+.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  if (isExpoGo()) {
    console.log('[Push] Expo Go detected: remote push registration bypassed (SDK 53+ requirement). Standalone/EAS builds support APNs/FCM.');
    return { token: null, status: 'simulator' };
  }

  if (!Device.isDevice) {
    console.log('[Push] Simulator detected: push notifications require a physical device.');
    return { token: null, status: 'simulator' };
  }

  try {
    const Notifications = require('expo-notifications');

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('heron-default', {
          name: 'Heron Assets Trustee Dispatches',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#F0B90B',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      } catch (channelErr) {
        console.log('[Push] Notification channel notice:', channelErr);
      }
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push] Permission not granted for push notifications.');
      return { token: null, status: 'denied' };
    }

    // Resolve projectId dynamically from EAS configuration
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      (Constants as any)?.manifest2?.extra?.eas?.projectId ||
      (Constants as any)?.manifest?.extra?.eas?.projectId;

    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });

    const token = pushTokenData?.data || null;
    console.log('[Push] Registered Expo Push Token:', token);

    return { token, status: 'granted' };
  } catch (err: any) {
    console.warn('[Push] Error retrieving push token:', err?.message || err);
    return { token: null, status: 'error', error: err?.message };
  }
}

/**
 * Add foreground notification received listener safely.
 */
export function addNotificationReceivedListener(callback: (notification: any) => void) {
  if (isExpoGo()) {
    return { remove: () => {} };
  }
  try {
    const Notifications = require('expo-notifications');
    return Notifications.addNotificationReceivedListener(callback);
  } catch (err) {
    console.log('[Push] Notification received listener bypassed:', err);
    return { remove: () => {} };
  }
}

/**
 * Add notification response received listener safely.
 */
export function addNotificationResponseReceivedListener(callback: (response: any) => void) {
  if (isExpoGo()) {
    return { remove: () => {} };
  }
  try {
    const Notifications = require('expo-notifications');
    return Notifications.addNotificationResponseReceivedListener(callback);
  } catch (err) {
    console.log('[Push] Notification response listener bypassed:', err);
    return { remove: () => {} };
  }
}

/**
 * Send a local simulation notification for testing in standalone or dev mode.
 */
export async function scheduleLocalNotification(title: string, body: string, data: Record<string, any> = {}) {
  if (isExpoGo()) {
    console.log(`[Push] Local Notification [Expo Go Mode]: "${title}" - "${body}"`);
    return;
  }
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        color: '#F0B90B',
      },
      trigger: null, // Send immediately
    });
  } catch (err) {
    console.log('[Push] Local notification schedule notice:', err);
  }
}
