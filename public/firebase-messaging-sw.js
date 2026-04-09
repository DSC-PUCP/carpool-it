// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration - these should match your Firebase project settings
const firebaseConfig = {
    apiKey: "AIzaSyArWfGJDyl6m585svcl3-pWVAN_nNLZFzg",
    authDomain: "carpool-it-40240.firebaseapp.com",
    projectId: "carpool-it-40240",
    storageBucket: "carpool-it-40240.appspot.com",
    messagingSenderId: "844796551152",
    appId: "1:844796551152:web:81d3ad7bbe10cc3a870735"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/favicon.ico', // Update with your app icon
    badge: '/favicon.ico',
    tag: payload.data?.tag || 'carpool-notification',
    data: payload.data || {},
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');

  event.notification.close();

  // Handle the action
  if (event.action === 'view') {
    // Open the app or navigate to specific page
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});
