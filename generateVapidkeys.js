const webPush = require('web-push');

// Menghasilkan VAPID keys
const vapidKeys = webPush.generateVAPIDKeys();
console.log(vapidKeys);
