const express = require('express');
// const qrcode = require('qrcode-terminal');
const app = express();

app.use(express.static('./public'));

app.all('*', (req, res) => {
    res.status(404).send('resource not found');
})

app.listen(5000, () => {
    console.log('server is listening on 5000');
})