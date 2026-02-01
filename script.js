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
    } catch (e) { console.error(e); }
}

function generateNewMessage() {
    if (btsQuotes.length === 0) return;
    const item = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
    document.getElementById('daily-quote').textContent = `"${item.quote}"`;
    document.getElementById('quote-author').textContent = `— ${item.author}, BTS`;
    document.getElementById('daily-song').textContent = item.song;
}

document.getElementById('new-quote-btn').addEventListener('click', generateNewMessage);

document.getElementById('save-alarm-btn').addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            const time = document.getElementById('schedule-time').value;
            const msg = btsQuotes[Math.floor(Math.random() * btsQuotes.length)] || {quote: "Avante!", song: "BTS"};
            
            document.getElementById('alarm-status').textContent = `Alerta para às ${time} 💜`;

            // Manda o horário e a frase para o Service Worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SCHEDULE_NOTIFICATION',
                    time: time,
                    quote: msg.quote,
                    song: msg.song
                });
                alert("Alarme agendado!");
            }
        } else {
            alert("Ative as notificações nas configurações do Chrome!");
        }
    });
});

carregarFrases();
