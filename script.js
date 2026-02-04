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

// --- ATIVAÇÃO DO ALARME ---
async function ativarNotificacoes() {
    const timeValue = document.getElementById('alarm-time').value;
    if (!timeValue) {
        alert("Escolha um horário primeiro!");
        return;
    }

    try {
        const reg = await navigator.serviceWorker.register('firebase-messaging-sw.js');
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            await navigator.serviceWorker.ready;
            
            // Força a ativação do controlador se ele for nulo
            if (!navigator.serviceWorker.controller) {
                window.location.reload();
                return;
            }

            navigator.serviceWorker.controller.postMessage({
                type: 'SET_ALARM',
                time: timeValue
            });

            document.getElementById('alarm-status').textContent = `Alarme para às ${timeValue}! 💜`;
            alert(`Sucesso! Notificação diária às ${timeValue}.`);
        }
    } catch (err) {
        alert("Erro ao conectar. Tente atualizar a página.");
    }
}

window.addEventListener('DOMContentLoaded', () => {
    carregarFrases();
    document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);
    document.getElementById('save-alarm-btn').addEventListener('click', ativarNotificacoes);
});

