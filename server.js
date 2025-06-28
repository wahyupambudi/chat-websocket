const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Map untuk menyimpan koneksi WebSocket berdasarkan user ID/nama
// Key: user ID/nama, Value: WebSocket object
const clients = new Map();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", function connection(ws, req) {
  // Setiap koneksi baru, kita perlu cara untuk mengidentifikasinya.
  // Untuk contoh ini, kita akan asumsikan user mengirim 'init_user:nama_user'
  // segera setelah terhubung untuk mendaftarkan dirinya.
  // Dalam aplikasi nyata, ini bisa dari sesi login atau token.

  console.log("Client connected");

  ws.on("message", function incoming(message) {
    const messageStr = message.toString();
    console.log("Received message: %s", messageStr);

    // Cek jika ini adalah pesan inisialisasi user
    if (messageStr.startsWith("init_user:")) {
      const userName = messageStr.split(":")[1];
      ws.userName = userName; // Simpan userName di objek ws
      clients.set(userName, ws); // Daftarkan user dan koneksinya
      console.log(`User '${userName}' registered.`);
      ws.send(`SERVER: Anda terhubung sebagai ${userName}.`);
      // Beri tahu semua klien tentang user baru yang terhubung
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.userName) {
          client.send(`SERVER: ${userName} telah bergabung.`);
        }
      });
      // Kirim daftar user yang online
      sendUserListToAll();
      return; // Penting: jangan proses sebagai pesan chat biasa
    }

    try {
      const parsedMessage = JSON.parse(messageStr);

      if (parsedMessage.type === "chat_message") {
        const { sender, recipient, content } = parsedMessage;

        if (recipient === "all") {
          // Pesan publik (broadcast ke semua kecuali pengirim)
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "chat_message",
                  sender: sender,
                  content: content,
                  recipient: "all",
                })
              );
            }
          });
          // Kirim juga ke pengirim agar ditampilkan di UI pengirim
          ws.send(
            JSON.stringify({
              type: "chat_message",
              sender: sender,
              content: content,
              recipient: "self",
            })
          );
        } else {
          // Pesan pribadi
          const recipientWs = clients.get(recipient);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            // Kirim ke penerima
            recipientWs.send(
              JSON.stringify({
                type: "private_message",
                sender: sender,
                content: content,
              })
            );
            // Konfirmasi ke pengirim bahwa pesan terkirim
            ws.send(
              JSON.stringify({
                type: "private_message_sent",
                recipient: recipient,
                content: content,
              })
            );
          } else {
            // Penerima tidak ditemukan atau tidak online
            ws.send(
              JSON.stringify({
                type: "error",
                message: `User '${recipient}' tidak ditemukan atau offline.`,
              })
            );
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse message or unknown message type:", e);
      console.log("Original message:", messageStr);
      // Tangani pesan yang tidak dalam format JSON yang diharapkan
      ws.send(
        JSON.stringify({ type: "error", message: "Format pesan tidak valid." })
      );
    }
  });

  ws.on("close", () => {
    // Hapus user dari map ketika koneksi ditutup
    if (ws.userName) {
      clients.delete(ws.userName);
      console.log(`User '${ws.userName}' disconnected.`);
      // Beri tahu semua klien user ini sudah offline
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.userName) {
          client.send(`SERVER: ${ws.userName} telah offline.`);
        }
      });
      sendUserListToAll(); // Perbarui daftar user
    } else {
      console.log("Client disconnected (unregistered)");
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Fungsi untuk mengirim daftar user yang online ke semua klien
function sendUserListToAll() {
  const onlineUsers = Array.from(clients.keys());
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.userName) {
      client.send(JSON.stringify({ type: "user_list", users: onlineUsers }));
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
