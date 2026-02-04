import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyB8cfcxxPVCaL0JzqvBLQYcnILsHsyGVhc",
    authDomain: "motivarmy-53e34.firebaseapp.com",
    projectId: "motivarmy-53e34",
    storageBucket: "motivarmy-53e34.firebasestorage.app",
    messagingSenderId: "205652769161",
    appId: "1:205652769161:web:b1e7936ed4f1a20f21c958",
    measurementId: "G-HB2R3MGFLV"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv";
let btsQuotes = [];

async function carregarFrases() {
    try {
        const response = await fetch(LINK_PLANILHA);
        const data = await response.text();
        const linhas = data.split(/\r?\n/).filter(l => l.trim() !== "");
        btsQuotes = linhas.slice(1).map(linha => {
            const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$/);
            return {
                quote: colunas[0]?.replace(/"/g, "").trim(),
                author: colunas[1]?.replace(/"/g, "").trim(),
                song: colunas[2]?.replace(/"/g, "").trim()
            };
        }).filter(i => i.quote);
        
        if (btsQuotes.length > 0) {
            generateNewMessage();
        } else {
            btsQuotes = [{
                quote: "Acredite em si mesmo e continue seguindo em frente.",
                author: "RM",
                song: "Yet To Come"
            }];
            generateNewMessage();
        }
    } catch (e) { 
        console.error("Erro planilha:", e);
        btsQuotes = [{
            quote: "Borahae! O app está funcionando offline.",
            author: "MotivArmy",
            song: "Yet To Come"
        }];
        generateNewMessage();
    }
}

function generateNewMessage() {
    if (btsQuotes.length === 0) {
        document.getElementById('daily-quote').textContent = '"Borahae! 💜"';
        document.getElementById('quote-author').textContent = '— BTS';
        document.getElementById('daily-song').textContent = 'Yet To Come';
        return;
    }
    
    const item = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
    document.getElementById('daily-quote').textContent = `"${item.quote}"`;
    document.getElementById('quote-author').textContent = `— ${item.author}, BTS`;
    document.getElementById('daily-song').textContent = item.song;
}

window.configurarAlarme = async function() {
    const timeInput = document.getElementById('alarm-time');
    const timeValue = timeInput ? timeInput.value : null;

    if (!timeValue) {
        alert("Escolha um horário primeiro!");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js');
            console.log('✅ Service Worker registrado:', registration);
            
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
            
            const tx = db.transaction('config', 'readwrite');
            const store = tx.objectStore('config');
            store.put(timeValue, 'alarm_time');
            
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
            
            try {
                const token = await getToken(messaging, { 
                    vapidKey: 'BI9RSO2EDyLlc_zHKHx4LWHd3o6Ie_Be4WUJgpI-iDmRsBfSlBTJmiyQ88BSOz71hJ6y0p34eVttDoZ12hGCq0A' 
                });
                
                if (token) {
                    console.log('✅ Token FCM obtido:', token.substring(0, 20) + '...');
                }
            } catch (tokenError) {
                console.warn('⚠️ Token FCM não obtido (normal se offline):', tokenError.message);
            }
            
            document.getElementById('alarm-status').innerHTML = `
                <i class="fas fa-bell" style="color: #9c6dff;"></i> 
                <strong>Alarme ativado para ${timeValue}</strong>
                <br><small>Você receberá uma mensagem motivacional todos os dias neste horário! 💜</small>
            `;
            
            if (registration.active) {
                setTimeout(() => {
                    registration.showNotification("✅ MotivArmy - Alarme Configurado", {
                        body: `Você receberá mensagens motivacionais do BTS todos os dias às ${timeValue}. Borahae! 💜`,
                        icon: 'icon.png',
                        badge: 'icon.png',
                        vibrate: [200, 100, 200],
                        tag: 'alarme-configurado'
                    });
                }, 1000);
            }
            
            alert(`✅ Alarme configurado com sucesso!\n\nVocê receberá notificações todos os dias às ${timeValue}.\n\nBorahae! 💜`);
        } else {
            alert("❌ Você precisa permitir as notificações para usar o alarme.\n\nVá nas configurações do navegador e permita notificações para este site.");
        }
    } catch (err) {
        console.error("❌ Erro ao configurar alarme:", err);
        document.getElementById('alarm-status').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
            Erro ao configurar. Recarregue a página e tente novamente.
        `;
        alert("❌ Ocorreu um erro: " + err.message + "\n\nRecarregue a página e tente novamente.");
    }
};

async function verificarAlarmeSalvo() {
    try {
        const request = indexedDB.open('MotivArmyDB', 1);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            const tx = db.transaction('config', 'readonly');
            const store = tx.objectStore('config');
            const getRequest = store.get('alarm_time');
            
            getRequest.onsuccess = function() {
                const horaSalva = getRequest.result;
                if (horaSalva) {
                    const timeInput = document.getElementById('alarm-time');
                    if (timeInput) timeInput.value = horaSalva;
                    
                    const statusEl = document.getElementById('alarm-status');
                    if (statusEl) {
                        statusEl.innerHTML = `
                            <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                            Alarme configurado: <strong>${horaSalva}</strong>
                            <br><small>Notificações ativas 💜</small>
                        `;
                    }
                }
            };
            
            getRequest.onerror = function() {
                console.log("Nenhum alarme salvo encontrado");
            };
        };
    } catch (e) {
        console.log("Primeira configuração de alarme");
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    carregarFrases();
    document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);
    
    await verificarAlarmeSalvo();
    
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js');
            console.log('Service Worker registrado na inicialização:', registration);
            
            if (Notification.permission === 'granted') {
                console.log('Permissão de notificação já concedida');
            }
        } catch (swError) {
            console.warn('Service Worker não registrado:', swError);
        }
    }
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'APP_LOADED',
            message: 'App MotivArmy carregado'
        });
    }
});

onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em primeiro plano:', payload);
    
    if (payload.notification) {
        const notificationTitle = payload.notification.title || '💜 MotivArmy';
        const notificationOptions = {
            body: payload.notification.body || 'Nova mensagem do BTS!',
            icon: 'icon.png'
        };
        
        if (Notification.permission === 'granted') {
            new Notification(notificationTitle, notificationOptions);
        }
    }
});
