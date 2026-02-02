// LINK DA SUA PLANILHA GOOGLE (CSV)
const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv";

let btsQuotes = [];

// 1. CARREGAR FRASES DA PLANILHA
async function carregarFrases() {
    try {
        const response = await fetch(LINK_PLANILHA);
        const data = await response.text();
        const linhas = data.split(/\r?\n/).filter(l => l.trim() !== "");
        
        btsQuotes = linhas.slice(1).map(linha => {
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

        if (btsQuotes.length > 0) {
            generateNewMessage();
        }
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

// 2. GERAR MENSAGEM NA TELA
function generateNewMessage() {
    if (btsQuotes.length === 0) return;
    const item = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
    document.getElementById('daily-quote').textContent = `"${item.quote}"`;
    document.getElementById('quote-author').textContent = `— ${item.author}, BTS`;
    document.getElementById('daily-song').textContent = item.song;
}

// 3. EVENTO DO BOTÃO DE NOVA MENSAGEM
document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);

// 4. SISTEMA DE ALARME COM PUSH LOCAL (VIA SERVICE WORKER)
document.getElementById('save-alarm-btn').addEventListener('click', async () => {
    // Solicita permissão explicitamente
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        const time = document.getElementById('schedule-time').value;
        document.getElementById('alarm-status').textContent = `Push ativado para às ${time} 💜`;

        // Confirmação visual imediata
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification("MotivArmy", {
                body: "Alarme configurado! Mantenha o app em segundo plano. 💜",
                icon: "icon.png"
            });
        });

        // Loop de verificação
        setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            if (currentTime === time) {
                const msg = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
                
                // Dispara a notificação via Service Worker (mais persistente)
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification("MotivArmy 💜", {
                        body: `"${msg.quote}" - Música: ${msg.song}`,
                        icon: "icon.png",
                        vibrate: [200, 100, 200],
                        badge: "icon.png",
                        tag: 'alarme-bts' // Evita notificações duplicadas
                    });
                });
            }
        }, 60000); // Checa a cada minuto
    } else {
        alert("Ops! Você precisa autorizar as notificações nas configurações do seu navegador.");
    }
});

// INICIALIZAR
carregarFrases();
