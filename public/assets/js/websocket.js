// public/assets/js/websocket.js

// Import necessary variables and functions
// Pastikan kita mengimpor variabel secara langsung dari constants.js
import {
  ws,
  myUserName,
  currentRecipient,
  setWs,
  setMyUserName,
  setCurrentRecipient,
} from "./constants.js";
import {
  addSystemMessage,
  addMessage,
  updateUserList,
  updateUserHistory,
  setUserInputState,
  resetUserInfo,
} from "./ui.js";
import {
  userNameInput,
  messageInput,
  sendButton,
  currentRecipientSpan,
} from "./domElements.js";

/**
 * Menginisialisasi koneksi WebSocket ke server.
 */
export function connectWebSocket() {
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    console.log("WebSocket is already open or connecting.");
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;

  const websocketUrl = `${protocol}//${host}`;

  const newWs = new WebSocket(websocketUrl); // Buat instance baru

  newWs.onopen = () => {
    addSystemMessage("Terhubung ke server chat.");
    // Kirim init_user jika nama pengguna sudah diatur
    if (myUserName) {
      newWs.send(`init_user:${myUserName}`);
    }
  };

  newWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        addMessage(
          data.sender,
          data.content,
          data.sender === myUserName ? "self" : "other"
        );
      } else if (data.type === "private_message") {
        addMessage(data.sender, data.content, "private");
      } else if (data.type === "private_message_sent") {
        addMessage(
          `${data.recipient} (Pribadi Anda)`,
          data.content,
          "self private"
        );
      } else if (data.type === "error") {
        addSystemMessage(`ERROR: ${data.message}`);
        if (data.message.includes("sudah dipakai")) {
          setUserInputState(false); // Enable user input
          setMyUserName(""); // Reset myUserName in constants
          resetUserInfo(); // Clear UI info
        }
      } else if (data.type === "server_message") {
        addSystemMessage(data.content);
      } else if (data.type === "user_list") {
        updateUserList(data.users);
      } else if (data.type === "user_history") {
        updateUserHistory(data.history);
        console.log("User history updated by server response:", data.history);
      }
    } catch (e) {
      addSystemMessage(event.data);
      console.warn("Received non-JSON message or parse error:", event.data, e);
    }
  };

  newWs.onclose = () => {
    addSystemMessage("Terputus dari server chat.");
    setUserInputState(false); // Enable user input
    setMyUserName(""); // Reset myUserName in constants
    resetUserInfo(); // Clear UI info
    setCurrentRecipient("all"); // Reset recipient
    currentRecipientSpan.textContent = "Semua";
    updateUserList([]); // Clear user list
  };

  newWs.onerror = (error) => {
    console.error("WebSocket error:", error);
    addSystemMessage("Terjadi kesalahan koneksi.");
  };

  setWs(newWs); // Set instance ke variabel global di constants
}

/**
 * Mengirim pesan ke server melalui WebSocket.
 * @param {string} message - Isi pesan.
 */
export function sendMessageToServer(message) {
  if (message.trim() === "") return;

  // Line 94: currentRecipient
  // Mengakses currentRecipient langsung dari import, yang akan berupa live binding.
  // Ini seharusnya sudah benar dengan import yang ada.
  // Error ini biasanya terjadi jika variabel 'currentRecipient' tidak diimpor sama sekali.
  // Karena sudah diimpor, kemungkinan lain adalah:
  // 1. Browser caching: Pastikan file JS terbaru diload.
  // 2. Lingkungan runtime: Kadang ada perbedaan perilaku di dev tools atau browser tertentu.
  // 3. Masalah siklus hidup: Jika kode dieksekusi sebelum modul 'constants.js' sepenuhnya dievaluasi.

  // Untuk memastikan, kita bisa tambahkan console.log di sini
  console.log(
    "Attempting to send message. currentRecipient:",
    currentRecipient
  );

  if (ws && ws.readyState === WebSocket.OPEN && myUserName) {
    const chatMessage = {
      type: "chat_message",
      sender: myUserName,
      recipient: currentRecipient, // variabel ini yang seharusnya sudah diimpor
      content: message,
    };
    ws.send(JSON.stringify(chatMessage));
    messageInput.value = ""; // Clear input after sending
  }
}
