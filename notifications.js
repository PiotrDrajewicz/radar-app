const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

client.initialize();

//connecting
client.on('qr', (qr) => {
    // console.log('qr received: ', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('client is ready');
})

client.on('message', message => {
    console.log(message.body);
    if (message.body === '!ping') {
        client.sendMessage(message.from, 'pong');
    }
});


