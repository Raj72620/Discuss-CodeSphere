
require('dotenv').config();
const fs = require('fs');

const log = (msg) => {
    fs.appendFileSync('debug_check.txt', msg + '\n');
}

try {
    log('Starting check');
    log('PORT from env: ' + process.env.PORT);
    log('MONGO URI: ' + (process.env.MONGODB_URI ? 'Exists' : 'Missing'));

    const express = require('express');
    const app = express();
    const port = process.env.PORT || 5000;

    const server = app.listen(port, () => {
        log('Successfully bound to port ' + port);
        server.close();
    });

    server.on('error', (err) => {
        log('Error binding to port: ' + err.message);
    });

} catch (e) {
    log('Crash: ' + e.message);
}
