const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();
const userHistory = new Set(); // Menggunakan Set untuk keunikan

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', function connection(ws, req) {
    console.log('Client connected');

    // Kirim riwayat user ke klien yang baru terhubung, segera setelah koneksi dibuat.
    sendUserHistoryToAll(ws); // Kirim ke klien spesifik yang baru terhubung
    // Atau bisa juga: ws.send(JSON.stringify({ type: 'user_history', history: Array.from(userHistory) }));

    ws.on('message', function incoming(message) {
        const messageStr = message.toString();
        console.log('Received message: %s', messageStr);

        if (messageStr.startsWith('init_user:')) {
            const userName = messageStr.split(':')[1];
            
            if (clients.has(userName)) {
                ws.send(JSON.stringify({ type: 'error', message: `Nama pengguna '${userName}' sudah dipakai. Mohon gunakan nama lain.` }));
                ws.close();
                return;
            }

            ws.userName = userName;
            clients.set(userName, ws);

            if (!userHistory.has(userName)) {
                userHistory.add(userName);
                console.log(`User '${userName}' added to history.`);
                // --- PERUBAHAN DI SINI ---
                // Kirim riwayat user yang diperbarui ke semua klien karena ada user baru di history
                sendUserHistoryToAll(); 
                // --- AKHIR PERUBAHAN ---
            }

            console.log(`User '${userName}' registered and is online.`);
            ws.send(JSON.stringify({ type: 'server_message', content: `Anda terhubung sebagai ${userName}.` }));
            
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN && client.userName) {
                    client.send(JSON.stringify({ type: 'server_message', content: `${userName} telah bergabung.` }));
                }
            });
            
            sendUserListToAll();
            return;
        }

        try {
            const parsedMessage = JSON.parse(messageStr);

            if (parsedMessage.type === 'chat_message') {
                const { sender, recipient, content } = parsedMessage;

                if (!ws.userName || ws.userName !== sender) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Anda harus terdaftar untuk mengirim pesan.' }));
                    return;
                }

                if (recipient === 'all') {
                    wss.clients.forEach(function each(client) {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'chat_message', sender: sender, content: content, recipient: 'all' }));
                        }
                    });
                    ws.send(JSON.stringify({ type: 'chat_message', sender: sender, content: content, recipient: 'self' }));

                } else {
                    const recipientWs = clients.get(recipient);
                    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                        recipientWs.send(JSON.stringify({ type: 'private_message', sender: sender, content: content }));
                        ws.send(JSON.stringify({ type: 'private_message_sent', recipient: recipient, content: content }));
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: `User '${recipient}' tidak ditemukan atau offline.` }));
                    }
                }
            }
        } catch (e) {
            console.error('Failed to parse message or unknown message type:', e);
            ws.send(JSON.stringify({ type: 'error', message: 'Format pesan tidak valid.' }));
        }
    });

    ws.on('close', () => {
        if (ws.userName) {
            clients.delete(ws.userName);
            console.log(`User '${ws.userName}' disconnected.`);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && client.userName) {
                    client.send(JSON.stringify({ type: 'server_message', content: `${ws.userName} telah offline.` }));
                }
            });
            sendUserListToAll();
            // --- PERUBAHAN DI SINI ---
            // Kirim riwayat user yang diperbarui ke semua klien karena ada user yang keluar
            // Ini mungkin tidak perlu jika user_history hanya menunjukkan siapa yang pernah join,
            // bukan siapa yang aktif. Jika hanya 'ever joined', tidak perlu dikirim ulang saat close.
            // sendUserHistoryToAll(); // Opsional, tergantung definisi 'history'
            // --- AKHIR PERUBAHAN ---
        } else {
            console.log('Client disconnected (unregistered)');
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Fungsi untuk mengirim daftar user yang online ke semua klien
function sendUserListToAll() {
    const onlineUsers = Array.from(clients.keys());
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.userName) {
            client.send(JSON.stringify({ type: 'user_list', users: onlineUsers }));
        }
    });
}

// --- FUNGSI BARU ---
// Fungsi untuk mengirim riwayat user ke klien tertentu atau semua klien
function sendUserHistoryToAll(targetClient = null) {
    const historyArray = Array.from(userHistory);
    if (targetClient && targetClient.readyState === WebSocket.OPEN) {
        // Kirim hanya ke klien spesifik
        targetClient.send(JSON.stringify({ type: 'user_history', history: historyArray }));
    } else {
        // Kirim ke semua klien yang terhubung
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'user_history', history: historyArray }));
            }
        });
    }
}
// --- AKHIR FUNGSI BARU ---

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});