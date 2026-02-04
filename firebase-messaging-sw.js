importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyB8cfcxxPVCaL0JzqvBLQYcnILsHsyGVhc",
    projectId: "motivarmy-53e34",
    messagingSenderId: "205652769161",
    appId: "1:205652769161:web:b1e7936ed4f1a20f21c958"
});

const messaging = firebase.messaging();
let frasesBTS = [];

async function carregarFrasesNoSW() {
    try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv');
        const data = await response.text();
        const linhas = data.split(/\r?\n/).filter(l => l.trim() !== "");
        
        frasesBTS = linhas.slice(1).map(linha => {
            const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$/);
            return {
                quote: colunas[0]?.replace(/"/g, "").trim(),
                author: colunas[1]?.replace(/"/g, "").trim(),
                song: colunas[2]?.replace(/"/g, "").trim()
            };
        }).filter(i => i.quote);
        
        if (frasesBTS.length === 0) {
            frasesBTS = [{
                quote: "Acredite em si mesmo e continue seguindo em frente.",
                author: "RM",
                song: "Yet To Come"
            }];
        }
    } catch (e) {
        console.error("Erro ao carregar frases no SW:", e);
        frasesBTS = [{
            quote: "Borahae! Não desista dos seus sonhos.",
            author: "BTS",
            song: "Yet To Come"
        }];
    }
}

carregarFrasesNoSW();

function enviarNotificacaoLocal() {
    if (frasesBTS.length === 0) {
        frasesBTS = [{
            quote: "Borahae! Tenha um ótimo dia!",
            author: "BTS",
            song: "Permission to Dance"
        }];
    }
    
    const item = frasesBTS[Math.floor(Math.random() * frasesBTS.length)];
    const titulo = "💜 MotivArmy BTS";
    const corpo = `${item.quote} (${item.author})`;
    
    const options = {
        body: corpo,
        icon: 'icon.png',
        badge: 'icon.png',
        vibrate: [200, 100, 200],
        tag: 'motivarmy-alarme',
        data: {
            url: self.location.origin,
            song: item.song,
            timestamp: Date.now()
        }
    };
    
    return self.registration.showNotification(titulo, options);
}

setInterval(async () => {
    try {
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('MotivArmyDB', 1);
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('config')) {
                    db.createObjectStore('config');
                }
            };
            
            request.onsuccess = function(event) {
                resolve(event.target.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
        
        const tx = db.transaction('config', 'readonly');
        const store = tx.objectStore('config');
        const request = store.get('alarm_time');
        
        request.onsuccess = function() {
            const horaSalva = request.result;
            if (horaSalva) {
                const agora = new Date();
                const horaAtual = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;
                
                if (horaAtual === horaSalva) {
                    enviarNotificacaoLocal();
                }
            }
        };
        
        request.onerror = function(error) {
            console.error("Erro ao buscar horário:", error);
        };
    } catch (error) {
        console.error("Erro no intervalo:", error);
    }
}, 60000);

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || '💜 MotivArmy';
    const notificationOptions = {
        body: payload.notification?.body || 'Nova mensagem motivacional do BTS!',
        icon: 'icon.png',
        badge: 'icon.png',
        vibrate: [200, 100, 200]
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                if (clientList.length > 0) {
                    let client = clientList[0];
                    for (let i = 0; i < clientList.length; i++) {
                        if (clientList[i].focused) {
                            client = clientList[i];
                            break;
                        }
                    }
                    return client.focus();
                }
                return clients.openWindow('/');
            })
    );
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'TEST_NOTIFICATION') {
        enviarNotificacaoLocal();
    }
});
