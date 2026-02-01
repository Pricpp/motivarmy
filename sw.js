const cacheName = 'motivarmy-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Escuta mensagens do script principal para agendar notificações
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { time, quote, song } = event.data;
    
    // Verifica o tempo a cada minuto dentro do Worker
    setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (currentTime === time) {
        self.registration.showNotification("MotivArmy 💜", {
          body: `"${quote}" - Ouça ${song}`,
          icon: "icon.png",
          vibrate: [200, 100, 200],
          badge: "icon.png"
        });
      }
    }, 60000);
  }
});
