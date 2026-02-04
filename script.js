import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Suas configurações do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB8cfcxxPVCaL0JzqvBLQYcnILsHsyGVhc",
    authDomain: "motivarmy-53e34.firebaseapp.com",
    projectId: "motivarmy-53e34",
    storageBucket: "motivarmy-53e34.firebasestorage.app",
    messagingSenderId: "205652769161",
    appId: "1:205652769161:web:b1e7936ed4f1a20f21c958",
    measurementId: "G-HB2R3MGFLV"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// --- LÓGICA DA PLANILHA (BTS) ---
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
        }).filter(i => i !== null);
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

document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);

// --- LÓGICA DE NOTIFICAÇÃO PUSH ---
document.getElementById('save-alarm-btn').addEventListener('click', async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        try {
            // Isso gera um "endereço" único para o seu celular receber mensagens
            const currentToken = await getToken(messaging, { vapidKey: 'ADICIONE_SUA_CHAVE_VAPID_AQUI' });
            if (currentToken) {
                console.log("Token:", currentToken);
                document.getElementById('alarm-status').textContent = "Notificações Reais Ativadas! 💜";
                alert("Pronto! Agora o Firebase pode te enviar mensagens.");
            }
        } catch (err) {
            console.log('Erro ao obter token:', err);
        }
    }
});

carregarFrases();
