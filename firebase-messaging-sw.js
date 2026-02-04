importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyB8cfcxxPVCaL0JzqvBLQYcnILsHsyGVhc",
    projectId: "motivarmy-53e34",
    messagingSenderId: "205652769161",
    appId: "1:205652769161:web:b1e7936ed4f1a20f21c958"
});

const messaging = firebase.messaging();

// Lógica para verificar o horário e mandar notificação local
let alarmTime = null;

self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_ALARM') {
        alarmTime = event.data.time;
    }
});

// Verifica a cada minuto se é hora de mandar a mensagem
setInterval(() => {
    if (!alarmTime) return;

    const agora = new Date();
    const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;

    if (horaAtual === alarmTime) {
        self.registration.showNotification('MotivArmy 💜', {
            body: 'Hora de brilhar! Confira sua frase motivacional do BTS no app.',
            icon: 'icon.png',
            tag: 'daily-alarm' // Evita notificações duplicadas no mesmo minuto
        });
    }
}, 60000); // Checa a cada 60 segundos
