import { customFetch } from '../utils';

const API_URL = '/api';

export const pushService = {
  async subscribe(subscription: PushSubscription) {
    const subJson = subscription.toJSON();
    const payload = {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
    };

    const response = await customFetch(`${API_URL}/push-subscriptions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  }
};
