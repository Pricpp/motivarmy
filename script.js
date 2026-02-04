import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// Configuração do seu Firebase
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
        }).filter(i => i.quote);
        if (btsQuotes.length > 0) generateNewMessage();
    } catch (e) { console.error("Erro na planilha:", e); }
}

function generateNewMessage() {
    if (btsQuotes.length === 0) return;
    const item = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
    document.getElementById('daily-quote').textContent = `"${item.quote}"`;
    document.getElementById('quote-author').textContent = `— ${item.author}, BTS`;
    document.getElementById('daily-song').textContent = item.song;
}

// --- CONFIGURAÇÃO DOS BOTÕES E NOTIFICAÇÃO ---
window.addEventListener('DOMContentLoaded', () => {
    carregarFrases();

    // Botão de Nova Mensagem
    document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);

    // Botão de Ativar/Salvar Alarme
    document.getElementById('save-alarm-btn').addEventListener('click', async () => {
        const timeValue = document.getElementById('alarm-time').value;
        
        if (!timeValue) {
            alert("Por favor, escolha um horário primeiro!");
            return;
        }

        try {
            // Registra o Service Worker
            const reg = await navigator.serviceWorker.register('firebase-messaging-sw.js');
            
            // Pede permissão
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // AGUARDA o Service Worker ficar ativo antes de enviar o postMessage
                await navigator.serviceWorker.ready;

                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SET_ALARM',
                        time: timeValue
                    });

                    document.getElementById('alarm-status').textContent = `Alarme definido para às ${timeValue}! 💜`;
                    alert(`Sucesso! Você receberá uma motivação todo dia às ${timeValue}.`);
                } else {
                    // Se não houver controlador (comum no primeiro acesso), recarrega para ativar
                    window.location.reload();
                }
            }
        } catch (err) {
            console.error('Erro ao configurar alarme:', err);
            alert("Erro técnico. Tente atualizar a página.");
        }
    });
});

// Escuta mensagens do Firebase com o app aberto
onMessage(messaging, (payload) => {
    alert(`💜 BTS diz: ${payload.notification.body}`);
});
