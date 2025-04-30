const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Extra: Serve socket.io client if needed
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));

// WhatsApp client with session persistence
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // change to false if you want to see browser
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR event
client.on('qr', (qr) => {
    console.log('📷 QR Received');
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('❌ Error generating QR:', err);
        } else {
            console.log('✅ QR URL Generated');
            io.emit('qr', url);
        }
    });
});

// Authenticated
client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');
    io.emit('ready', 'WhatsApp is connected successfully!');
});

// Auth failure
client.on('auth_failure', (msg) => {
    console.error('❌ Auth failure:', msg);
});

// Disconnect
client.on('disconnected', (reason) => {
    console.warn('⚠️ Disconnected:', reason);
    io.emit('disconnected', reason);
});

// Socket connected
io.on('connection', (socket) => {
    console.log('🧠 New socket connected');
});

// Start WhatsApp client
client.initialize();

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
