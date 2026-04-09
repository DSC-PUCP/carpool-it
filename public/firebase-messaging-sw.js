// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyArWfGJDyl6m585svcl3-pWVAN_nNLZFzg',
  authDomain: 'carpool-it-40240.firebaseapp.com',
  projectId: 'carpool-it-40240',
  storageBucket: 'carpool-it-40240.appspot.com',
  messagingSenderId: '844796551152',
  appId: '1:844796551152:web:81d3ad7bbe10cc3a870735',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

function resolveNotificationUrl(data) {
  if (data?.url) return data.url;
  if (data?.link) return data.link;
  if (data?.room_id) return `/travel/${data.room_id}`;
  return '/';
}

function buildNotificationOptions(payload) {
  const notification = payload.notification || {};
  const payloadData = payload.data || {};
  const data = {
    ...payloadData,
    url:
      payloadData.url ||
      payload.fcmOptions?.link ||
      resolveNotificationUrl(payloadData),
  };

  return {
    body: notification.body || payloadData.body || 'Tienes una nueva notificación',
    icon: notification.icon || '/logo192.png',
    badge: '/favicon.ico',
    tag: payloadData.tag || `carpool-${payloadData.type || 'notification'}`,
    data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver',
      },
    ],
  };
}

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || payload.data?.title || 'Notificación';
  const notificationOptions = buildNotificationOptions(payload);

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action && event.action !== 'view') {
    return;
  }

  const targetUrl = new URL(
    resolveNotificationUrl(event.notification.data),
    self.location.origin,
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(
      (windowClients) => {
        for (const client of windowClients) {
          if (!client.url.startsWith(self.location.origin)) continue;

          if ('focus' in client) {
            if ('navigate' in client && client.url !== targetUrl) {
              client.navigate(targetUrl);
            }

            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      },
    ),
  );
});
