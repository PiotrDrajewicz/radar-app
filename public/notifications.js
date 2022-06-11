export { sendNotification };

function sendNotification() {
    const qrcode = require('qrcode-terminal');

    const { Client } = require('whatsapp-web.js');
    const client = new Client();

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
        console.log('qr code received');
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    // client.on('message', message => {
    //     console.log(message.body);
    // });

    // client.on('message', message => {
    //     if (message.body === 'halo') {
    //         client.sendMessage(message.from, 'spadaj');
    //     }
    // });

    client.initialize();
}