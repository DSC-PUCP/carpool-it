// Firebase Messaging Service Worker.
// Keep FIREBASE_VERSION in sync with the `firebase` dependency in package.json.
const FIREBASE_VERSION = '12.19.0';
const DEFAULT_ICON = '/logo192.png';

importScripts(
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`
);
importScripts(
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`
);

// The client registers this worker as
// /firebase-messaging-sw.js?apiKey=...&authDomain=...&projectId=...
const params = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: params.get('apiKey') || undefined,
  authDomain: params.get('authDomain') || undefined,
  projectId: params.get('projectId') || undefined,
  storageBucket: params.get('storageBucket') || undefined,
  messagingSenderId: params.get('messagingSenderId') || undefined,
  appId: params.get('appId') || undefined,
};

function resolveUrl(value) {
  try {
    const url = new URL(value || '/', self.location.origin);
    return url.origin === self.location.origin ? url.href : null;
  } catch {
    return null;
  }
}

function resolveNotificationUrl(data) {
  if (data && typeof data.url === 'string') {
    const resolved = resolveUrl(data.url);
    if (resolved) return resolved;
  }

  if (data && typeof data.room_id === 'string' && data.room_id.length > 0) {
    return resolveUrl(`/travel/${data.room_id}`) || self.location.origin;
  }

  return self.location.origin;
}

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  const app = firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging(app);

  messaging.onBackgroundMessage((payload) => {
    const data = (payload && payload.data) || {};
    const title = data.title || 'Carpool It';
    const body = data.body || 'Tienes una nueva notificación';

    // iOS requires a visible notification for every push, so this handler
    // always shows one. Payloads are data-only, so there is no duplicate from
    // the SDK itself.
    self.registration.showNotification(title, {
      body,
      icon: DEFAULT_ICON,
      tag: data.tag || 'carpool',
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: resolveNotificationUrl(data),
      },
    });
  });
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = resolveNotificationUrl(event.notification.data);

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (new URL(client.url).origin !== self.location.origin) continue;
          if (!('focus' in client)) continue;

          if ('navigate' in client && client.url !== targetUrl) {
            client.navigate(targetUrl);
          }

          return client.focus();
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});
