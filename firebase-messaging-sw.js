importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyB8cfcxxPVCaL0JzqvBLQYcnILsHsyGVhc",
    projectId: "motivarmy-53e34",
    messagingSenderId: "205652769161",
    appId: "1:205652769161:web:b1e7936ed4f1a20f21c958"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'icon.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
