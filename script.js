// COLE O SEU LINK DO GOOGLE SHEETS (CSV) ABAIXO
const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv.";

let btsQuotes = [];

async function carregarFrases() {
    try {
        const response = await fetch(LINK_PLANILHA);
        const data = await response.text();
        
        // Divide as linhas da planilha
        const linhas = data.split(/\r?\n/).slice(1); 
        
        btsQuotes = linhas.map(linha => {
            // Divide por vírgula, mas lida com frases que podem ter vírgulas dentro
            const colunas = linha.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (colunas && colunas.length >= 3) {
                return {
                    quote: colunas[0].replace(/"/g, ""),
                    author: colunas[1].replace(/"/g, ""),
                    song: colunas[2].replace(/"/g, "")
                };
            }
            return null;
        }).filter(item => item !== null);

        generateNewMessage();
    } catch (error) {
        console.error("Erro ao carregar frases:", error);
    }
}

function generateNewMessage() {
    if (btsQuotes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * btsQuotes.length);
    const item = btsQuotes[randomIndex];
    
    document.getElementById('daily-quote').textContent = `"${item.quote.trim()}"`;
    document.getElementById('quote-author').textContent = `— ${item.author.trim()}, BTS`;
    document.getElementById('daily-song').textContent = item.song.trim();
}

// Configura o botão de nova mensagem
document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);

// Configura o alarme/notificação
document.getElementById('save-alarm-btn').addEventListener('click', () => {
    if (!("Notification" in window)) {
        alert("Notificações não suportadas.");
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
                        body: `${msg.quote} - Ouça ${msg.song}`,
                        icon: "icon.png"
                    });
                }
            }, 60000); 
        }
    });
});

// Inicia o carregamento da planilha
carregarFrases();
