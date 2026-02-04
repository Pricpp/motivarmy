self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'MotivArmy', body: 'Borahae! 💜' };
    const options = {
        body: data.body,
        icon: 'icon.png',
        badge: 'icon.png',
        vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Isso permite que o app envie notificações locais
self.addEventListener('showNotification', event => {
    const options = {
        body: event.body,
        icon: 'icon.png',
        vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification(event.title, options));
});
