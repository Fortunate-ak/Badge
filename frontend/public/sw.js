self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    self.registration.showNotification(data.title || 'Badge Notification', {
      body: data.body || 'You have a new notification',
      icon: '/vite.svg', // or other icon
    });
  } else {
    console.log('Push event but no data');
  }
});
