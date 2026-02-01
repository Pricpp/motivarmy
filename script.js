const LINK_PLANILHA = "https://docs.google.com/spreadsheets/d/1C7YXElLIQZftsSqfxrMh-wN-i4pzz1DpwS16F2WiCFc/export?format=csv";
let btsQuotes = [];

async function carregarFrases() {
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
  });
}

async function registrarServiceWorker() {
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.register("sw.js");
    return reg;
  }
}

async function salvarHorario(time) {
  localStorage.setItem("horarioNotificacao", time);
}

function carregarHorario() {
  return localStorage.getItem("horarioNotificacao");
}

function proximoHorario(time) {
  const [h, m] = time.split(":").map(Number);
  const agora = new Date();
  const alvo = new Date();
  alvo.setHours(h, m, 0, 0);
  if (alvo <= agora) alvo.setDate(alvo.getDate() + 1);
  return alvo;
}

async function agendarNotificacao(time) {
  const reg = await registrarServiceWorker();
  const msg = btsQuotes[Math.floor(Math.random() * btsQuotes.length)];
  const data = proximoHorario(time);

  await reg.showNotification("MotivArmy 💜", {
    body: `"${msg.quote}" — Ouça ${msg.song}`,
    icon: "icon.png",
    badge: "icon.png",
    tag: "motivarmy",
    showTrigger: new TimestampTrigger(data.getTime()),
    data: { time }
  });
}

document.getElementById("setAlarmBtn").addEventListener("click", async () => {
  const time = document.getElementById("alarmTime").value;
  if (!time) return alert("Escolha um horário!");

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return alert("Ative as notificações!");

  await salvarHorario(time);
  await agendarNotificacao(time);
  alert("Notificação agendada com sucesso!");
});

window.onload = async () => {
  await carregarFrases();
  const salvo = carregarHorario();
  if (salvo) {
    document.getElementById("alarmTime").value = salvo;
    await agendarNotificacao(salvo);
  }
};
