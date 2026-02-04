import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Configuração do Firebase (Tuas chaves oficiais)
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

// --- LÓGICA DA PLANILHA GOOGLE ---
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

// --- FUNÇÃO GLOBAL DO BOTÃO (O SEGREDO PARA FUNCIONAR) ---
window.configurarAlarme = async function() {
    const timeInput = document.getElementById('alarm-time');
    const timeValue = timeInput ? timeInput.value : null;

    if (!timeValue) {
        alert("Por favor, escolhe um horário primeiro!");
        return;
    }

    try {
        // Pede permissão para notificações
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // Regista o Service Worker para o Firebase
            await navigator.serviceWorker.register('firebase-messaging-sw.js');
            
            // Obtém o Token de registo
            const token = await getToken(messaging, { 
                vapidKey: 'BI9RSO2EDyLlc_zHKHx4LWHd3o6Ie_Be4WUJgpI-iDmRsBfSlBTJmiyQ88BSOz71hJ6y0p34eVttDoZ12hGCq0A' 
            });

            if (token) {
                localStorage.setItem('motivarmy_alarm_time', timeValue);
                document.getElementById('alarm-status').textContent = `Conectado! Notificações às ${timeValue} 💜`;
                alert("Sucesso! O MotivArmy está pronto para te motivar.");
            }
        } else {
            alert("Precisas de permitir as notificações no navegador!");
        }
    } catch (err) {
        console.error("Erro técnico:", err);
        alert("Quase lá! Atualiza a página e tenta clicar no botão novamente.");
    }
};

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    carregarFrases();
    document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);
});
