// public/assets/js/websocket.js

import {
  ws,
  myUserName,
  currentRecipient,
  setWs,
  setMyUserName,
  setCurrentRecipient,
  setCurrentGroupMembers,
} from "./constants.js"; // BARU: import setCurrentGroupMembers
import {
  addSystemMessage,
  addMessage,
  updateUserList,
  updateUserHistory,
  setUserInputState,
  resetUserInfo,
  updateAvailableGroups,
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
    if (myUserName) {
      newWs.send(`init_user:${myUserName}`);
    }
  };

  newWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        // Pesan publik
        addMessage(
          data.sender,
          data.content,
          data.sender === myUserName ? "self" : "other"
        );
      } else if (data.type === "private_message") {
        // Pesan pribadi yang diterima
        addMessage(data.sender, data.content, "private");
      } else if (data.type === "private_message_sent_echo") {
        // Pesan pribadi yang Anda kirim (echo)
        addMessage(data.recipient, data.content, "private_message_sent_echo");
      } else if (data.type === "group_message") {
        // BARU: Pesan grup
        addMessage(data.sender, data.content, "group_message", data.group);
      } else if (data.type === "error") {
        addSystemMessage(`ERROR: ${data.message}`);
        if (data.message.includes("sudah dipakai")) {
          setUserInputState(false);
          setMyUserName("");
          resetUserInfo();
        }
      } else if (data.type === "server_message") {
        addSystemMessage(data.content);
      } else if (data.type === "user_list") {
        updateUserList(data.users);
      } else if (data.type === "user_history") {
        updateUserHistory(data.history);
        console.log("User history updated by server response:", data.history);
      } else if (data.type === "available_groups") {
        // BARU: Daftar grup yang tersedia
        updateAvailableGroups(data.groups);
      } else if (data.type === "group_members_update") {
        // BARU: Anggota grup (jika Anda ingin menampilkannya)
        // Ini bisa digunakan untuk menampilkan anggota grup di UI jika diinginkan
        // Untuk saat ini, kita hanya log atau bisa membuat fungsi UI baru
        setCurrentGroupMembers(data.members);
        const currentGroupsFromDOM = Array.from(
          groupList.querySelectorAll("li[data-group]")
        ).map((li) => li.dataset.group);
        updateAvailableGroups(currentGroupsFromDOM);
        console.log("Group Members Update:", data.members);
      }
    } catch (e) {
      addSystemMessage(event.data);
      console.warn("Received non-JSON message or parse error:", event.data, e);
    }
  };

  newWs.onclose = () => {
    addSystemMessage("Terputus dari server chat.");
    setUserInputState(false);
    setMyUserName("");
    resetUserInfo();
    setCurrentRecipient("#public"); // Default ke #public saat terputus
    currentRecipientSpan.textContent = "#public";
    updateUserList([]);
    updateAvailableGroups(["public"]); // Reset grup yang tersedia ke hanya 'public'
  };

  newWs.onerror = (error) => {
    console.error("WebSocket error:", error);
    addSystemMessage("Terjadi kesalahan koneksi.");
  };

  setWs(newWs);
}

/**
 * Mengirim pesan ke server melalui WebSocket.
 * @param {string} message - Isi pesan.
 */
export function sendMessageToServer(message) {
  if (message.trim() === "") return;

  if (ws && ws.readyState === WebSocket.OPEN && myUserName) {
    let chatMessage;
    // Tentukan apakah pesan ini untuk grup atau user/all
    if (currentRecipient.startsWith("#")) {
      const groupName = currentRecipient.substring(1); // Hapus '#'
      chatMessage = {
        type: "chat_message", // Tipe umum, server akan menangani routing
        sender: myUserName,
        recipient: currentRecipient, // Ini akan menjadi #groupname
        content: message,
        group: groupName, // Tambahkan info grup
      };
    } else {
      chatMessage = {
        type: "chat_message",
        sender: myUserName,
        recipient: currentRecipient,
        content: message,
      };
    }

    ws.send(JSON.stringify(chatMessage));
    messageInput.value = "";
  }
}

// --- BARU: Fungsi untuk mengirim perintah grup ---
/**
 * Mengirim perintah untuk membuat grup baru.
 * @param {string} groupName - Nama grup yang akan dibuat.
 */
export function createGroup(groupName) {
  if (ws && ws.readyState === WebSocket.OPEN && myUserName) {
    ws.send(JSON.stringify({ type: "create_group", groupName: groupName }));
  } else {
    addSystemMessage(
      "Anda tidak terhubung. Silakan gabung chat terlebih dahulu."
    );
  }
}

/**
 * Mengirim perintah untuk bergabung dengan grup.
 * @param {string} groupName - Nama grup yang akan digabung.
 */
export function joinGroup(groupName) {
  if (ws && ws.readyState === WebSocket.OPEN && myUserName) {
    ws.send(JSON.stringify({ type: "join_group", groupName: groupName }));
  } else {
    addSystemMessage(
      "Anda tidak terhubung. Silakan gabung chat terlebih dahulu."
    );
  }
}

/**
 * Mengirim perintah untuk meninggalkan grup.
 * @param {string} groupName - Nama grup yang akan ditinggalkan.
 */
export function leaveGroup(groupName) {
  if (ws && ws.readyState === WebSocket.OPEN && myUserName) {
    ws.send(JSON.stringify({ type: "leave_group", groupName: groupName }));
  } else {
    addSystemMessage(
      "Anda tidak terhubung. Silakan gabung chat terlebih dahulu."
    );
  }
}
