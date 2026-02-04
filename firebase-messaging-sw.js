importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyB8cfcxxPVCaL0JzqvBLQYcnILsHsyGVhc",
    projectId: "motivarmy-53e34",
    messagingSenderId: "205652769161",
    appId: "1:205652769161:web:b1e7936ed4f1a20f21c958"
});

const messaging = firebase.messaging();

// Verifica o alarme a cada minuto
setInterval(async () => {
    // Tenta ler o horário guardado
    const allData = await self.clients.matchAll();
    // Como o SW não lê localStorage direto, ele pede aos clientes abertos
    // Mas para simplificar para outras pessoas, ele usará um sistema de verificação global
    
    // Para funcionar com o app fechado, o ideal é o Firebase enviar. 
    // Mas para o teste local funcionar agora:
    const agora = new Date();
    const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
    
    // Esta parte será disparada quando o horário coincidir (configurado no script.js)
}, 60000);

// Escuta notificações do painel do Firebase (para as tuas metas de 3.000 reais)
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'icon.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
