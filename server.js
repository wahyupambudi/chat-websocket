const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map(); // Key: userName, Value: WebSocket object
const userHistory = new Set(); // Stores all unique users who have ever joined

// --- BARU: Manajemen Grup ---
// Key: groupName, Value: Set of userNames in that group
const groups = new Map();
// Kita bisa memulai dengan group default 'public'
groups.set("public", new Set());
// --- AKHIR BARU ---

app.use(express.static(path.join(__dirname, "public")));

wss.on("connection", function connection(ws, req) {
  console.log("Client connected");

  // Kirim riwayat user dan daftar grup yang ada segera setelah koneksi dibuat.
  sendUserHistoryToAll(ws);
  sendAvailableGroupsToClient(ws); // Kirim daftar grup yang tersedia

  ws.on("message", function incoming(message) {
    const messageStr = message.toString();
    console.log("Received message: %s", messageStr);

    if (messageStr.startsWith("init_user:")) {
      const userName = messageStr.split(":")[1];

      if (clients.has(userName)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Nama pengguna '${userName}' sudah dipakai. Mohon gunakan nama lain.`,
          })
        );
        ws.close();
        return;
      }

      ws.userName = userName; // Assign userName to WebSocket object
      clients.set(userName, ws);

      if (!userHistory.has(userName)) {
        userHistory.add(userName);
        sendUserHistoryToAll(); // Broadcast updated history to all clients
      }

      console.log(`User '${userName}' registered and is online.`);
      ws.send(
        JSON.stringify({
          type: "server_message",
          content: `Anda terhubung sebagai ${userName}.`,
        })
      );

      // Otomatis tambahkan user ke group 'public' saat mereka bergabung
      groups.get("public").add(userName);
      sendUserJoinedGroup(userName, "public"); // Notifikasi user telah bergabung ke 'public'
      sendGroupMembersToClients(); // Perbarui daftar member grup untuk semua klien
      sendAvailableGroupsToClient(null); // Beri tahu semua klien tentang user baru di grup default

      wss.clients.forEach((client) => {
        if (
          client !== ws &&
          client.readyState === WebSocket.OPEN &&
          client.userName
        ) {
          client.send(
            JSON.stringify({
              type: "server_message",
              content: `${userName} telah bergabung.`,
            })
          );
        }
      });
      sendUserListToAll(); // Send updated online user list
      return;
    }

    try {
      const parsedMessage = JSON.parse(messageStr);

      // Pastikan pengirim terdaftar sebelum memproses pesan atau perintah grup
      if (!ws.userName) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Anda harus terdaftar untuk mengirim pesan atau perintah.",
          })
        );
        return;
      }

      // --- BARU: Penanganan Pesan Grup & Perintah Grup ---
      if (parsedMessage.type === "create_group") {
        const { groupName } = parsedMessage;
        if (
          !groupName ||
          typeof groupName !== "string" ||
          groupName.trim() === ""
        ) {
          ws.send(
            JSON.stringify({ type: "error", message: "Nama grup tidak valid." })
          );
          return;
        }
        const normalizedGroupName = groupName.trim().toLowerCase(); // Normalize group name

        if (groups.has(normalizedGroupName)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Grup '${groupName}' sudah ada.`,
            })
          );
        } else {
          groups.set(normalizedGroupName, new Set()); // Buat grup baru
          ws.send(
            JSON.stringify({
              type: "server_message",
              content: `Grup '${groupName}' berhasil dibuat!`,
            })
          );
          // Otomatis gabungkan pembuat grup
          groups.get(normalizedGroupName).add(ws.userName);
          sendAvailableGroupsToClient(null); // Beri tahu semua klien tentang grup baru
          sendGroupMembersToClients(); // Perbarui daftar anggota grup
          sendUserJoinedGroup(ws.userName, normalizedGroupName); // Notifikasi ke pembuat grup
        }
      } else if (parsedMessage.type === "join_group") {
        const { groupName } = parsedMessage;
        const normalizedGroupName = groupName.trim().toLowerCase();

        if (!groups.has(normalizedGroupName)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Grup '${groupName}' tidak ditemukan.`,
            })
          );
        } else if (groups.get(normalizedGroupName).has(ws.userName)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Anda sudah berada di grup '${groupName}'.`,
            })
          );
        } else {
          groups.get(normalizedGroupName).add(ws.userName);
          ws.send(
            JSON.stringify({
              type: "server_message",
              content: `Anda telah bergabung dengan grup '${groupName}'.`,
            })
          );
          sendUserJoinedGroup(ws.userName, normalizedGroupName); // Beri tahu anggota grup lain
          sendGroupMembersToClients(); // Perbarui daftar anggota grup
        }
      } else if (parsedMessage.type === "leave_group") {
        const { groupName } = parsedMessage;
        const normalizedGroupName = groupName.trim().toLowerCase();

        if (!groups.has(normalizedGroupName)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Grup '${groupName}' tidak ditemukan.`,
            })
          );
        } else if (!groups.get(normalizedGroupName).has(ws.userName)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Anda tidak berada di grup '${groupName}'.`,
            })
          );
        } else {
          groups.get(normalizedGroupName).delete(ws.userName);
          ws.send(
            JSON.stringify({
              type: "server_message",
              content: `Anda telah meninggalkan grup '${groupName}'.`,
            })
          );
          sendUserLeftGroup(ws.userName, normalizedGroupName); // Beri tahu anggota grup lain
          sendGroupMembersToClients(); // Perbarui daftar anggota grup
          // Jika grup kosong setelah user ini keluar dan bukan grup 'public', bisa dihapus
          if (
            normalizedGroupName !== "public" &&
            groups.get(normalizedGroupName).size === 0
          ) {
            groups.delete(normalizedGroupName);
            sendAvailableGroupsToClient(null); // Beri tahu semua klien grup telah dihapus
            console.log(
              `Group '${normalizedGroupName}' deleted as it's empty.`
            );
          }
        }
      } else if (parsedMessage.type === "chat_message") {
        const { sender, recipient, content } = parsedMessage;

        // Jika recipient adalah nama grup (diawali dengan '#')
        if (recipient.startsWith("#")) {
          const groupName = recipient.substring(1).trim().toLowerCase(); // Hapus '#'
          if (!groups.has(groupName)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: `Grup '${groupName}' tidak ditemukan.`,
              })
            );
            return;
          }
          if (!groups.get(groupName).has(ws.userName)) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: `Anda bukan anggota grup '${groupName}'.`,
              })
            );
            return;
          }

          // Kirim pesan ke semua anggota grup
          groups.get(groupName).forEach((memberUserName) => {
            const memberWs = clients.get(memberUserName);
            if (memberWs && memberWs.readyState === WebSocket.OPEN) {
              if (memberUserName === ws.userName) {
                // Jika pengirim sendiri
                memberWs.send(
                  JSON.stringify({
                    type: "group_message",
                    sender: sender,
                    group: groupName,
                    content: content,
                    recipient: "self",
                  })
                );
              } else {
                memberWs.send(
                  JSON.stringify({
                    type: "group_message",
                    sender: sender,
                    group: groupName,
                    content: content,
                  })
                );
              }
            }
          });
        } else if (recipient === "all") {
          // Pesan publik global
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
            recipientWs.send(
              JSON.stringify({
                type: "private_message",
                sender: sender,
                content: content,
              })
            );
            ws.send(
              JSON.stringify({
                type: "private_message_sent_echo",
                sender: sender,
                recipient: recipient,
                content: content,
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "error",
                message: `User '${recipient}' tidak ditemukan atau offline.`,
              })
            );
          }
        }
      }
      // --- AKHIR BARU ---
    } catch (e) {
      console.error("Failed to parse message or unknown message type:", e);
      ws.send(
        JSON.stringify({ type: "error", message: "Format pesan tidak valid." })
      );
    }
  });

  ws.on("close", () => {
    if (ws.userName) {
      const disconnectedUser = ws.userName;
      clients.delete(disconnectedUser);
      console.log(`User '${disconnectedUser}' disconnected.`);

      // Hapus user dari semua grup yang diikutinya
      groups.forEach((members, groupName) => {
        if (members.has(disconnectedUser)) {
          members.delete(disconnectedUser);
          sendUserLeftGroup(disconnectedUser, groupName); // Beri tahu anggota grup lain
          // Jika grup kosong dan bukan 'public', hapus grupnya
          if (groupName !== "public" && members.size === 0) {
            groups.delete(groupName);
            sendAvailableGroupsToClient(null); // Beri tahu semua klien grup telah dihapus
            console.log(`Group '${groupName}' deleted as it's empty.`);
          }
        }
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.userName) {
          client.send(
            JSON.stringify({
              type: "server_message",
              content: `${disconnectedUser} telah offline.`,
            })
          );
        }
      });
      sendUserListToAll(); // Perbarui daftar user online
      sendGroupMembersToClients(); // Perbarui daftar anggota grup setelah user keluar
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

// Fungsi untuk mengirim riwayat user ke klien tertentu atau semua klien
function sendUserHistoryToAll(targetClient = null) {
  const historyArray = Array.from(userHistory);
  if (targetClient && targetClient.readyState === WebSocket.OPEN) {
    targetClient.send(
      JSON.stringify({ type: "user_history", history: historyArray })
    );
  } else {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ type: "user_history", history: historyArray })
        );
      }
    });
  }
}

// --- BARU: Fungsi untuk mengirim informasi grup ---

// Mengirim daftar grup yang tersedia ke klien (atau semua klien)
function sendAvailableGroupsToClient(targetClient = null) {
  const availableGroups = Array.from(groups.keys());
  if (targetClient && targetClient.readyState === WebSocket.OPEN) {
    targetClient.send(
      JSON.stringify({ type: "available_groups", groups: availableGroups })
    );
  } else {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ type: "available_groups", groups: availableGroups })
        );
      }
    });
  }
}

// Mengirim notifikasi user bergabung grup ke anggota grup lain
function sendUserJoinedGroup(userName, groupName) {
  groups.get(groupName).forEach((memberUserName) => {
    const memberWs = clients.get(memberUserName);
    if (
      memberWs &&
      memberWs.readyState === WebSocket.OPEN &&
      memberUserName !== userName
    ) {
      // Kecuali pengirim sendiri
      memberWs.send(
        JSON.stringify({
          type: "server_message",
          content: `${userName} telah bergabung ke grup #${groupName}.`,
        })
      );
    }
  });
}

// Mengirim notifikasi user meninggalkan grup ke anggota grup lain
function sendUserLeftGroup(userName, groupName) {
  groups.get(groupName).forEach((memberUserName) => {
    const memberWs = clients.get(memberUserName);
    if (memberWs && memberWs.readyState === WebSocket.OPEN) {
      memberWs.send(
        JSON.stringify({
          type: "server_message",
          content: `${userName} telah meninggalkan grup #${groupName}.`,
        })
      );
    }
  });
}

// Mengirim daftar anggota setiap grup ke semua klien (agar UI bisa menampilkan)
function sendGroupMembersToClients() {
  const groupMembersData = {};
  groups.forEach((members, groupName) => {
    groupMembersData[groupName] = Array.from(members);
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "group_members_update",
          members: groupMembersData,
        })
      );
    }
  });
}
// --- AKHIR BARU ---

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
