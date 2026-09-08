import { NotificationMessage } from '../types';

export interface PushMessagePayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

class PushNotificationService {
  private expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  /**
   * Validate if a string is a valid Expo push token
   */
  public isExpoPushToken(token: string): boolean {
    return typeof token === 'string' && /^(ExponentPushToken|ExpoPushToken)\[.*\]$/.test(token.trim());
  }

  /**
   * Dispatch push notifications to a list of tokens via Expo Push Service (APNs & FCM bridge)
   */
  public async sendPushNotifications(
    tokens: string[],
    payload: { title: string; body: string; data?: Record<string, any> }
  ): Promise<{ success: boolean; sentCount: number; errors?: any[] }> {
    const validTokens = tokens.filter(t => this.isExpoPushToken(t));

    if (validTokens.length === 0) {
      return { success: true, sentCount: 0 };
    }

    const messages: PushMessagePayload[] = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      priority: 'high',
      channelId: 'heron-default',
    }));

    try {
      // Chunk messages in batches of 100 per Expo documentation
      const chunkSize = 100;
      let sentCount = 0;
      const errors: any[] = [];

      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        const res = await fetch(this.expoPushUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
          },
          body: JSON.stringify(chunk),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('[Push Service] Expo push gateway error:', res.status, errText);
          errors.push({ status: res.status, error: errText });
        } else {
          const result: any = await res.json();
          console.log(`[Push Service] Successfully dispatched ${chunk.length} push notification(s):`, result?.data?.length || 0);
          sentCount += chunk.length;
        }
      }

      return { success: errors.length === 0, sentCount, errors: errors.length ? errors : undefined };
    } catch (err: any) {
      console.error('[Push Service] Network error dispatching push notifications:', err?.message || err);
      return { success: false, sentCount: 0, errors: [err?.message || err] };
    }
  }

  /**
   * Dispatches push notification for a created system notification
   */
  public async dispatchNotification(
    notification: NotificationMessage,
    targetTokens: string[]
  ): Promise<void> {
    if (!targetTokens || targetTokens.length === 0) return;

    await this.sendPushNotifications(targetTokens, {
      title: `Heron Trustees • ${notification.title}`,
      body: notification.message,
      data: {
        notificationId: notification.id,
        type: notification.type,
        sender: notification.sender,
        createdAt: notification.createdAt,
      },
    });
  }
}

export const pushService = new PushNotificationService();
