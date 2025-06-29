const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const userNameInput = document.getElementById("user-name-input");
const setUserNameButton = document.getElementById("set-user-name-button");
const currentUserInfo = document.getElementById("current-user-info");
const currentRecipientSpan = document.getElementById("current-recipient");
const userList = document.getElementById("user-list");
const userHistoryTags = document.getElementById("user-history-tags");

let ws = null;
let myUserName = "";
let currentRecipient = "all";

// --- Event Listeners ---
setUserNameButton.addEventListener("click", () => {
  const userName = userNameInput.value.trim();
  if (userName) {
    myUserName = userName;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(`init_user:${myUserName}`);
    } else {
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
    // Saat mengklik, kita juga perlu memperbarui kelas 'selected' secara langsung
    const currentSelected = userList.querySelector(".selected");
    if (currentSelected) currentSelected.classList.remove("selected");

    targetLi.classList.add("selected"); // Tambahkan kelas selected

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

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host; // Akan menjadi 'localhost:3000' saat dev, atau 'namadomainanda.com' saat deploy
  ws = new WebSocket(`${protocol}//${host}`);

  ws.onopen = () => {
    addSystemMessage("Terhubung ke server chat.");
    if (myUserName) {
      ws.send(`init_user:${myUserName}`);
    }
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
        updateUserHistory(data.history);
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
    // Panggil updateUserList untuk memastikan 'Semua' terpilih dan daftar bersih
    updateUserList([]); // Kirim array kosong untuk membersihkan user online
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    addSystemMessage("Terjadi kesalahan koneksi.");
  };
}

document.addEventListener("DOMContentLoaded", connectWebSocket);

// --- Fungsi lain ---
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

// --- Fungsi untuk mendapatkan inisial ---
function getInitials(name) {
  if (!name) return "";
  const words = name.split(" ").filter((word) => word.length > 0);
  if (words.length > 1) {
    // Ambil inisial dari dua kata pertama jika ada
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  // Jika hanya satu kata, ambil huruf pertama
  return name[0].toUpperCase();
}

function addMessage(sender, content, type = "other") {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("flex", "mb-2", "items-end", "max-w-[90%]");

  // Untuk pesan yang dikirim sendiri (self), tata letak avatar dan nama ada di kanan
  if (type === "self") {
    messageContainer.classList.add("ml-auto", "justify-end");
  } else {
    messageContainer.classList.add("mr-auto", "justify-start");
  }

  // Buat wadah untuk avatar dan nama (di luar gelembung pesan)
  const avatarNameContainer = document.createElement("div");
  avatarNameContainer.classList.add(
    "flex",
    "flex-col",
    "items-center",
    "text-center",
    "mx-2",
    "flex-shrink-0"
  ); // Tambahkan margin dan tata letak vertikal

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add(
    "user-avatar-placeholder",
    "w-8",
    "h-8",
    "rounded-full",
    "flex",
    "items-center",
    "justify-center",
    "text-sm",
    "font-bold",
    "bg-gray-300",
    "text-gray-800"
  ); // Default styling untuk avatar
  avatarDiv.textContent = getInitials(sender); // Ambil inisial

  const senderNameSpan = document.createElement("span");
  senderNameSpan.classList.add(
    "text-xs",
    "text-gray-600",
    "mt-1",
    "max-w-[60px]",
    "truncate"
  ); // Gaya untuk nama pengirim di bawah avatar
  senderNameSpan.textContent = type === "self" ? "Anda" : sender;

  // Gabungkan avatar dan nama ke dalam container
  avatarNameContainer.appendChild(avatarDiv);
  avatarNameContainer.appendChild(senderNameSpan);

  const messageContentDiv = document.createElement("div");
  messageContentDiv.classList.add(
    "p-3",
    "rounded-2xl",
    "leading-tight",
    "shadow-sm",
    "text-sm"
  );

  const contentP = document.createElement("p");
  contentP.textContent = content;

  // Tentukan gaya gelembung pesan
  if (type === "self") {
    messageContentDiv.classList.add(
      "bg-blue-600",
      "text-white",
      "rounded-br-sm"
    );
  } else if (type === "other") {
    messageContentDiv.classList.add(
      "bg-gray-200",
      "text-gray-800",
      "rounded-bl-sm"
    );
  } else if (type === "private") {
    messageContentDiv.classList.add(
      "bg-yellow-100",
      "text-yellow-800",
      "border",
      "border-yellow-300",
      "rounded-bl-sm"
    );
  }

  messageContentDiv.appendChild(contentP); // Tambahkan konten pesan

  // Atur urutan elemen berdasarkan tipe pesan
  if (type === "self") {
    // Untuk pesan sendiri, avatar di kanan, gelembung pesan di kiri
    messageContainer.appendChild(messageContentDiv);
    messageContainer.appendChild(avatarNameContainer);
  } else if (type === "other" || type === "private") {
    // Untuk pesan orang lain, avatar di kiri, gelembung pesan di kanan
    messageContainer.appendChild(avatarNameContainer);
    messageContainer.appendChild(messageContentDiv);
  }
  // Pesan sistem tidak perlu avatar

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

// --- FUNGSI updateUserList yang dimodifikasi ---
function updateUserList(users) {
  userList.innerHTML = ""; // Hapus semua item daftar yang ada

  // Buat dan tambahkan item "Semua (Public Chat)"
  const allOption = document.createElement("li");
  allOption.dataset.user = "all";
  allOption.classList.add(
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
  allOption.innerHTML = `<span class="user-status-indicator w-2.5 h-2.5 rounded-full bg-green-400 mr-3 shadow-md"></span>Semua (Public Chat)`;
  userList.appendChild(allOption);

  // Terapkan kelas 'selected' dan gaya background/text berdasarkan currentRecipient
  // Penting: Pastikan ini mencakup kedua kondisi (selected dan non-selected)
  if (currentRecipient === "all") {
    allOption.classList.add("text-gray-700", "text-black", "selected");
    allOption.classList.remove("bg-blue-500", "hover:bg-gray-100"); // Pastikan kelas non-selected dihapus
  } else {
    allOption.classList.add("text-gray-700", "hover:bg-gray-100");
    allOption.classList.remove("bg-blue-500", "text-white", "selected"); // Pastikan kelas selected dihapus
  }

  // Tambahkan user online lainnya
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

      // Terapkan kelas 'selected' dan gaya background/text jika user ini adalah currentRecipient
      if (user === currentRecipient) {
        li.classList.remove("bg-blue-500", "text-white", "selected");
        li.classList.add("text-gray-700", "hover:bg-gray-100");
      } else {
        li.classList.add("text-gray-700", "hover:bg-gray-100");
        li.classList.remove("bg-blue-500", "text-white", "selected");
      }
      userList.appendChild(li);
    }
  });
}

function updateUserHistory(history) {
  userHistoryTags.innerHTML = "";
  history.forEach((user) => {
    const span = document.createElement("span");
    span.classList.add(
      "inline-flex",
      "items-center",
      "px-3",
      "py-1",
      "rounded-full",
      "text-sm",
      "font-medium",
      "bg-purple-100",
      "text-purple-800",
      "shadow-sm"
    );
    span.textContent = user;
    userHistoryTags.appendChild(span);
  });
}
