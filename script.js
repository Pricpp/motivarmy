// LINK DA SUA PLANILHA GOOGLE (CSV)
const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv";

let btsQuotes = [];

// 1. FUNÇÃO PARA CARREGAR AS FRASES DA PLANILHA
async function carregarFrases() {
    try {
        const response = await fetch(LINK_PLANILHA);
        const data = await response.text();
        
        // Divide as linhas e limpa espaços vazios
        const linhas = data.split(/\r?\n/).filter(linha => linha.trim() !== "");
        
        // Pula o cabeçalho e mapeia os dados
        btsQuotes = linhas.slice(1).map(linha => {
            // Separa por vírgula mas respeita aspas
            const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (colunas.length >= 3) {
                return {
                    quote: colunas[0].replace(/"/g, "").trim(),
                    author: colunas[1].replace(/"/g, "").trim(),
                    song: colunas[2].replace(/"/g, "").trim()
                };
            }
            return null;
        }).filter(item => item !== null);

        // Gera a primeira mensagem assim que carregar
        if (btsQuotes.length > 0) {
            generateNewMessage();
        }
    } catch (error) {
        console.error("Erro ao carregar frases:", error);
        document.getElementById('daily-quote').textContent = "Conecte-se à internet para carregar as mensagens.";
    }
}

// 2. FUNÇÃO PARA EXIBIR UMA MENSAGEM ALEATÓRIA
function generateNewMessage() {
    if (btsQuotes.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * btsQuotes.length);
    const item = btsQuotes[randomIndex];
    
    document.getElementById('daily-quote').textContent = `"${item.quote}"`;
    document.getElementById('quote-author').textContent = `— ${item.author}, BTS`;
    document.getElementById('daily-song').textContent = item.song;
}

// 3. CONFIGURAÇÃO DO BOTÃO "NOVA MENSAGEM"
document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);

// 4. CONFIGURAÇÃO DO ALARME E NOTIFICAÇÕES
document.getElementById('save-alarm-btn').addEventListener('click', () => {
    if (!("Notification" in window)) {
        alert("Este navegador não suporta notificações.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            const time = document.getElementById('schedule-time').value;
            document.getElementById('alarm-status').textContent = `Alerta ativado para às ${time} 💜`;
            
            // Notificação de confirmação imediata
            const confirmMsg = "Seu alarme MotivArmy foi configurado!";
            dispararNotificacao("Alarme Ativado", confirmMsg);

            // Verifica o horário a cada minuto
            const checkTime = setInterval(() => {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                
                if (currentTime === time) {
                    const msg = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
                    const textoNotificacao = `"${msg.quote}" - Ouça ${msg.song}`;
                    dispararNotificacao("MotivArmy 💜", textoNotificacao);
                }
            }, 60000); 
        } else {
            alert("Você precisa permitir as notificações nas configurações do seu celular.");
        }
    });
});

// 5. FUNÇÃO AUXILIAR PARA DISPARAR A NOTIFICAÇÃO (MAIS FORTE)
function dispararNotificacao(titulo, corpo) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(titulo, {
                body: corpo,
                icon: "icon.png",
                vibrate: [200, 100, 200],
                badge: "icon.png"
            });
        });
    } else {
        new Notification(titulo, {
            body: corpo,
            icon: "icon.png"
        });
    }
}

// INICIALIZA O CARREGAMENTO
carregarFrases();
