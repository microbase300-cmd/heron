import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure how notifications appear when the app is in the foreground
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

export interface PushRegistrationResult {
  token: string | null;
  status: 'granted' | 'denied' | 'undetermined' | 'simulator' | 'error';
  error?: string;
}

/**
 * Register this device for Expo / APNs / FCM Push Notifications.
 * Returns the Expo Push Token if permission is granted on a physical device.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('heron-default', {
      name: 'Heron Assets Trustees Dispatches',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F0B90B',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  if (!Device.isDevice) {
    console.log('[Push] Running on simulator/emulator; push notifications require a physical device.');
    return { token: null, status: 'simulator' };
  }

  try {
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

    token = pushTokenData.data;
    console.log('[Push] Registered Expo Push Token:', token);

    return { token, status: 'granted' };
  } catch (err: any) {
    console.warn('[Push] Error retrieving push token:', err?.message || err);
    return { token: null, status: 'error', error: err?.message };
  }
}

/**
 * Send a local simulation notification for testing in Expo Go or dev mode.
 */
export async function scheduleLocalNotification(title: string, body: string, data: Record<string, any> = {}) {
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
}
