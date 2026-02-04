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

// --- LÓGICA DA PLANILHA ---
const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv";
let btsQuotes = [];

async function carregarFrases() {
    try {
        const response = await fetch(LINK_PLANILHA);
        const data = await response.text();
        const linhas = data.split(/\r?\n/).filter(l => l.trim() !== "");
        btsQuotes = linhas.slice(1).map(linha => {
            const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return {
                quote: colunas[0]?.replace(/"/g, "").trim(),
                author: colunas[1]?.replace(/"/g, "").trim(),
                song: colunas[2]?.replace(/"/g, "").trim()
            };
        }).filter(i => i.quote);
        if (btsQuotes.length > 0) generateNewMessage();
    } catch (e) { console.error("Erro planilha:", e); }
}

function generateNewMessage() {
    if (btsQuotes.length === 0) return;
    const item = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
    document.getElementById('daily-quote').textContent = `"${item.quote}"`;
    document.getElementById('quote-author').textContent = `— ${item.author}, BTS`;
    document.getElementById('daily-song').textContent = item.song;
}

// --- ESSA É A FUNÇÃO QUE O BOTÃO CHAMA ---
// Tornamos ela global para o HTML encontrar
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
            await navigator.serviceWorker.register('firebase-messaging-sw.js');
            
            const token = await getToken(messaging, { 
                vapidKey: 'BI9RSO2EDyLlc_zHKHx4LWHd3o6Ie_Be4WUJgpI-iDmRsBfSlBTJmiyQ88BSOz71hJ6y0p34eVttDoZ12hGCq0A' 
            });

            if (token) {
                localStorage.setItem('motivarmy_alarm_time', timeValue);
                document.getElementById('alarm-status').textContent = `Conectado! Alarme às ${timeValue} 💜`;
                alert("Sucesso! Agora o MotivArmy vai te enviar notificações.");
            }
        } else {
            alert("Você precisa permitir as notificações!");
        }
    } catch (err) {
        console.error("Erro:", err);
        alert("Ocorreu um erro. Tente atualizar a página.");
    }
};

window.addEventListener('DOMContentLoaded', () => {
    carregarFrases();
    document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);
});
