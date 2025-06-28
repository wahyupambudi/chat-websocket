const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const userNameInput = document.getElementById("user-name-input");
const setUserNameButton = document.getElementById("set-user-name-button");
const currentUserInfo = document.getElementById("current-user-info");
const currentRecipientSpan = document.getElementById("current-recipient");
const userList = document.getElementById("user-list");
const userHistoryList = document.getElementById("user-history-list");

let ws = null;
let myUserName = "";
let currentRecipient = "all";

// --- Event Listeners ---
setUserNameButton.addEventListener("click", () => {
  const userName = userNameInput.value.trim();
  if (userName) {
    myUserName = userName;

    // Pastikan WebSocket terhubung sebelum mengirim init_user
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(`init_user:${myUserName}`);
    } else {
      // Jika belum terhubung, buat koneksi dan akan kirim init_user di onopen
      connectWebSocket();
    }

    userNameInput.disabled = true;
    setUserNameButton.disabled = true;
    messageInput.disabled = false;
    sendButton.disabled = false;
    currentUserInfo.textContent = `Anda: ${myUserName}`;
  } else {
    alert("Nama pengguna tidak boleh kosong!");
  }
});

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

userList.addEventListener("click", (e) => {
  const targetLi = e.target.closest("li");
  if (targetLi && targetLi.dataset.user) {
    const currentSelected = userList.querySelector(".selected");
    if (currentSelected) currentSelected.classList.remove("selected");
    targetLi.classList.add("selected");
    currentRecipient = targetLi.dataset.user;
    currentRecipientSpan.textContent =
      currentRecipient === "all" ? "Semua" : currentRecipient;
    addSystemMessage(
      `Anda sekarang mengirim pesan ke: ${
        currentRecipient === "all" ? "Semua" : currentRecipient
      }`
    );
  }
});

// --- WebSocket Connection ---
function connectWebSocket() {
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    console.log("WebSocket is already open or connecting.");
    return;
  }

  // Tentukan host WebSocket secara dinamis
  // Menggunakan window.location.host untuk mendapatkan 'localhost:3000' atau 'example.com'
  // dan window.location.protocol untuk 'http:' atau 'https:'
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host; // Akan menjadi 'localhost:3000' saat dev, atau 'namadomainanda.com' saat deploy

  ws = new WebSocket(`${protocol}//${host}`);

  ws.onopen = () => {
    addSystemMessage("Terhubung ke server chat.");
    // Kirim init_user jika nama pengguna sudah diatur (dari klik "Gabung Chat")
    if (myUserName) {
      ws.send(`init_user:${myUserName}`);
    }
    // Server akan mengirim user_history secara otomatis saat koneksi dibuka.
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        if (data.sender === myUserName || data.recipient === "self") {
          addMessage(data.sender, data.content, "self");
        } else {
          addMessage(data.sender, data.content, "other");
        }
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
          userNameInput.disabled = false;
          setUserNameButton.disabled = false;
          messageInput.disabled = true;
          sendButton.disabled = true;
          myUserName = "";
          currentUserInfo.textContent = "";
        }
      } else if (data.type === "server_message") {
        addSystemMessage(data.content);
      } else if (data.type === "user_list") {
        updateUserList(data.users);
      } else if (data.type === "user_history") {
        // Ini akan dipanggil baik saat halaman dimuat (koneksi awal)
        // maupun saat user mengirim init_user (karena server merespons).
        updateUserHistory(data.history);
        // Tambahkan log untuk debug
        console.log("User history updated by server response:", data.history);
      }
    } catch (e) {
      addSystemMessage(event.data);
      console.warn("Received non-JSON message or parse error:", event.data, e);
    }
  };

  ws.onclose = () => {
    addSystemMessage("Terputus dari server chat.");
    messageInput.disabled = true;
    sendButton.disabled = true;
    userNameInput.disabled = false;
    setUserNameButton.disabled = false;
    myUserName = "";
    currentUserInfo.textContent = "";
    currentRecipient = "all";
    currentRecipientSpan.textContent = "Semua";
    userList.innerHTML = `
                    <li data-user="all" class="flex items-center p-3 cursor-pointer rounded-md mb-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition duration-200 selected">
                        <span class="user-status-indicator w-2.5 h-2.5 rounded-full bg-green-400 mr-3 shadow-md"></span>
                        Semua (Public Chat)
                    </li>
                `;
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    addSystemMessage("Terjadi kesalahan koneksi.");
  };
}

// --- Panggil connectWebSocket saat halaman dimuat ---
document.addEventListener("DOMContentLoaded", connectWebSocket);

// --- Fungsi lain tetap sama ---
function sendMessage() {
  const message = messageInput.value.trim();
  if (message && ws && ws.readyState === WebSocket.OPEN && myUserName) {
    const chatMessage = {
      type: "chat_message",
      sender: myUserName,
      recipient: currentRecipient,
      content: message,
    };
    ws.send(JSON.stringify(chatMessage));
    messageInput.value = "";
  }
}

function addMessage(sender, content, type = "other") {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("flex", "mb-2", "items-end", "max-w-[90%]");

  const messageContentDiv = document.createElement("div");
  messageContentDiv.classList.add(
    "p-3",
    "rounded-2xl",
    "leading-tight",
    "shadow-sm",
    "text-sm"
  );

  const senderSpan = document.createElement("div");
  senderSpan.classList.add("font-semibold", "text-xs", "mb-1");

  const contentP = document.createElement("p");
  contentP.textContent = content;

  if (type === "self") {
    messageContainer.classList.add("ml-auto", "justify-end");
    messageContentDiv.classList.add(
      "bg-blue-600",
      "text-white",
      "rounded-br-sm"
    );
    senderSpan.classList.add("text-blue-200", "text-right");
    senderSpan.textContent = "Anda";
  } else if (type === "other") {
    messageContainer.classList.add("mr-auto", "justify-start");
    messageContentDiv.classList.add(
      "bg-gray-200",
      "text-gray-800",
      "rounded-bl-sm"
    );
    senderSpan.classList.add("text-gray-600", "text-left");
    senderSpan.textContent = sender;
  } else if (type === "private") {
    messageContainer.classList.add("mr-auto", "justify-start");
    messageContentDiv.classList.add(
      "bg-yellow-100",
      "text-yellow-800",
      "border",
      "border-yellow-300",
      "rounded-bl-sm"
    );
    senderSpan.classList.add("text-yellow-700", "text-left");
    senderSpan.textContent = `PRIBADI dari ${sender}`;
  }

  if (type !== "system") {
    messageContentDiv.prepend(senderSpan);
  }
  messageContentDiv.appendChild(contentP);
  messageContainer.appendChild(messageContentDiv);
  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addSystemMessage(message) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("flex", "justify-center", "w-full", "my-2");

  const messageContentDiv = document.createElement("div");
  messageContentDiv.classList.add(
    "text-gray-500",
    "italic",
    "text-xs",
    "text-center",
    "px-3",
    "py-1",
    "rounded-full",
    "bg-gray-100",
    "max-w-md"
  );
  messageContentDiv.textContent = message;

  messageContainer.appendChild(messageContentDiv);
  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateUserList(users) {
  const allOption = userList.querySelector('[data-user="all"]');
  userList.innerHTML = "";
  userList.appendChild(allOption);

  if (currentRecipient === "all") {
    allOption.classList.add(
      "bg-blue-500",
      "text-white",
      "hover:bg-blue-600",
      "selected"
    );
  } else {
    allOption.classList.remove(
      "bg-blue-500",
      "text-white",
      "hover:bg-blue-600",
      "selected"
    );
    allOption.classList.add("text-gray-700", "hover:bg-gray-100");
  }

  users.forEach((user) => {
    if (user !== myUserName) {
      const li = document.createElement("li");
      li.dataset.user = user;
      li.classList.add(
        "flex",
        "items-center",
        "p-3",
        "cursor-pointer",
        "rounded-md",
        "mb-2",
        "font-medium",
        "transition",
        "duration-200"
      );
      li.innerHTML = `<span class="user-status-indicator w-2.5 h-2.5 rounded-full bg-green-400 mr-3 shadow-md"></span>${user}`;
      if (user === currentRecipient) {
        li.classList.add(
          "bg-blue-500",
          "text-white",
          "hover:bg-blue-600",
          "selected"
        );
      } else {
        li.classList.add("text-gray-700", "hover:bg-gray-100");
      }
      userList.appendChild(li);
    }
  });
}

function updateUserHistory(history) {
  userHistoryList.innerHTML = "";
  history.forEach((user) => {
    const li = document.createElement("li");
    li.classList.add(
      "flex",
      "items-center",
      "p-2",
      "text-gray-600",
      "text-sm",
      "mb-1",
      "rounded-md",
      "bg-gray-50"
    );
    li.innerHTML = `<span class="text-gray-400 mr-2">&bull;</span> ${user}`;
    userHistoryList.appendChild(li);
  });
}
