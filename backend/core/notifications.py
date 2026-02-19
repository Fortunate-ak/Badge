import json
from pywebpush import webpush, WebPushException
from django.conf import settings
from accounts.models import PushSubscription

# In a real application, these should be in settings.py or environment variables
# For this prototype, we'll keep them here or use what we generated earlier.
# If we generated keys earlier, we should use those.
# But for simplicity in this environment, I will use the ones I generated in the terminal session
# (assuming the user wants me to use those, or I can generate new ones and log them).

# PRIVATE_KEY and PUBLIC_KEY generated previously:
VAPID_PRIVATE_KEY = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg/JRRcIXJDW7w/hZ6bc2mxp68++mOaXJXlsywJTjJI+qhRANCAATc5C4Z1pHXjNGH4k1QBwG5Htni3697bpwf827UY53ZX5yy4l6MuYVU+mAg96J0sFOxs1HfZycFea2QvEaefIWj"
# We need to extract the raw private key from the PEM or just use the library to load it.
# pywebpush can handle PEM strings.

VAPID_CLAIMS = {
    "sub": "mailto:admin@example.com"
}

def send_push_notification(user, title, body):
    subscriptions = PushSubscription.objects.filter(user=user)

    payload = json.dumps({
        "title": title,
        "body": body,
    })

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }
                },
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
        except WebPushException as ex:
            print(f"WebPush failed: {repr(ex)}")
            # If the subscription is invalid (410), we should probably delete it
            if ex.response and ex.response.status_code == 410:
                sub.delete()
        except Exception as e:
            print(f"Error sending push: {e}")
