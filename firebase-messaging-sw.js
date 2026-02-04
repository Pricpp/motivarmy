importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyB8cfcxxPVCaL0JzqvBLQYcnILsHsyGVhc",
    projectId: "motivarmy-53e34",
    messagingSenderId: "205652769161",
    appId: "1:205652769161:web:b1e7936ed4f1a20f21c958"
});

const messaging = firebase.messaging();

// Faz o Service Worker assumir o controlo imediatamente
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

let alarmTime = null;

self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_ALARM') {
        alarmTime = event.data.time;
    }
});

setInterval(() => {
    if (!alarmTime) return;
    const agora = new Date();
    const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;

    if (horaAtual === alarmTime) {
        self.registration.showNotification('MotivArmy 💜', {
            body: 'Hora de brilhar! Foco nos R$ 3.000 e na Anatomia! 🍰',
            icon: 'icon.png'
        });
    }
}, 60000);
