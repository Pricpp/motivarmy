const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv";

let btsQuotes = [];

async function carregarFrases() {
    try {
        const response = await fetch(LINK_PLANILHA);
        const data = await response.text();
        
        // Divide o texto em linhas e remove espaços em branco
        const linhas = data.split(/\r?\n/).filter(linha => linha.trim() !== "");
        
        // Pula a primeira linha (cabeçalho) e processa o restante
        btsQuotes = linhas.slice(1).map(linha => {
            // Divide por vírgula, mas lida com textos entre aspas
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

        console.log("Frases carregadas:", btsQuotes.length);
        generateNewMessage();
    } catch (error) {
        console.error("Erro ao carregar frases:", error);
    }
}

function generateNewMessage() {
    if (btsQuotes.length === 0) {
        console.log("Nenhuma frase disponível ainda.");
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * btsQuotes.length);
    const item = btsQuotes[randomIndex];
    
    document.getElementById('daily-quote').textContent = `"${item.quote}"`;
    document.getElementById('quote-author').textContent = `— ${item.author}, BTS`;
    document.getElementById('daily-song').textContent = item.song;
}

// Evento do botão de nova mensagem
document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);

// Evento do Alarme/Notificação
document.getElementById('save-alarm-btn').addEventListener('click', () => {
    if (!("Notification" in window)) {
        alert("Notificações não suportadas neste navegador.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            const time = document.getElementById('schedule-time').value;
            document.getElementById('alarm-status').textContent = `Ativado para às ${time} 💜`;
            
            setInterval(() => {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                if (currentTime === time) {
                    const msg = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
                    new Notification("MotivArmy 💜", {
                        body: `"${msg.quote}" - Ouça ${msg.song}`,
                        icon: "icon.png"
                    });
                }
            }, 60000); 
        }
    });
});

// Carrega as frases assim que o app abre
carregarFrases();
