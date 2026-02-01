const btsQuotes = [
    { quote: "Nunca desista, não importa o quão difícil seja.", author: "RM", song: "Yet To Come" },
    { quote: "Sonhe alto. Se você não sonhar, nada vai acontecer.", author: "Suga", song: "Dream Glow" },
    { quote: "Amar a si mesmo é o começo de um romance eterno.", author: "RM", song: "Answer: Love Myself" },
    { quote: "Mesmo quando cai e me machuco, continuo seguindo.", author: "J-Hope", song: "Intro: Boy Meets Evil" },
    { quote: "A vida é uma montanha-russa, aproveite o passeio.", author: "V", song: "00:00 (Zero O'Clock)" },
    { quote: "Apague todas as memórias tristes. Segure as mãos um do outro e sorria.", author: "BTS", song: "2! 3!" }
];

const dailyQuoteEl = document.getElementById('daily-quote');
const quoteAuthorEl = document.getElementById('quote-author');
const dailySongEl = document.getElementById('daily-song');
const newQuoteBtn = document.getElementById('new-quote-btn');
const saveAlarmBtn = document.getElementById('save-alarm-btn');
const scheduleTimeInput = document.getElementById('schedule-time');
const alarmStatus = document.getElementById('alarm-status');

function generateNewMessage() {
    const randomIndex = Math.floor(Math.random() * btsQuotes.length);
    const item = btsQuotes[randomIndex];
    dailyQuoteEl.textContent = `"${item.quote}"`;
    quoteAuthorEl.textContent = `— ${item.author}, BTS`;
    dailySongEl.textContent = item.song;
    return item;
}

saveAlarmBtn.addEventListener('click', () => {
    if (!("Notification" in window)) {
        alert("Navegador sem suporte a notificações.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            const time = scheduleTimeInput.value;
            alarmStatus.textContent = `Notificação ativa para às ${time}! 💜`;
            
            setInterval(() => {
                const now = new Date();
                const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                if (currentTime === time) {
                    const msg = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
                    new Notification("MotivArmy 💜", {
                        body: `"${msg.quote}" - Escute ${msg.song}!`,
                        icon: "icon.png"
                    });
                }
            }, 60000); 
        }
    });
});

newQuoteBtn.addEventListener('click', generateNewMessage);
