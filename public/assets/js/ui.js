// public/assets/js/ui.js

import {
  chatBox,
  messageInput,
  sendButton,
  userNameInput,
  setUserNameButton,
  currentUserInfo,
  currentRecipientSpan,
  userList,
  userHistoryTags,
  groupNameInput,
  createGroupButton,
  groupList,
} from "./domElements.js";
import {
  myUserName,
  currentRecipient,
  setMyUserName,
  setCurrentRecipient,
} from "./constants.js";
import { getInitials, stringToColor } from "./utils.js";

/**
 * Menambahkan pesan ke kotak chat.
 * @param {string} sender - Nama pengirim asli.
 * @param {string} content - Isi pesan.
 * @param {string} type - Tipe pesan ('self', 'other', 'private', 'private_message_sent_echo', 'group_message').
 * 'private_message_sent_echo' adalah tipe internal untuk pesan pribadi yang Anda kirim.
 */
export function addMessage(sender, content, type = "other", groupName = null) {
  // Tambahkan groupName parameter
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("flex", "mb-2", "items-end", "max-w-[90%]");

  const isMyMessage =
    type === "self" ||
    type === "private_message_sent_echo" ||
    (type === "group_message" && sender === myUserName);

  if (isMyMessage) {
    messageContainer.classList.add("ml-auto", "justify-end");
  } else {
    messageContainer.classList.add("mr-auto", "justify-start");
  }

  const avatarNameContainer = document.createElement("div");
  avatarNameContainer.classList.add(
    "flex",
    "flex-col",
    "items-center",
    "text-center",
    "mx-2",
    "flex-shrink-0"
  );

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
  );

  const senderNameSpan = document.createElement("span");
  senderNameSpan.classList.add(
    "text-xs",
    "text-gray-600",
    "mt-1",
    "max-w-[60px]",
    "truncate"
  );

  let displaySenderName;
  let avatarInitials;
  let bubbleBgClasses = [];
  let bubbleTextClasses = [];
  let bubbleRoundedClass;
  let borderColorClasses = [];

  switch (type) {
    case "self": // Pesan publik yang Anda kirim
      displaySenderName = "Anda";
      avatarInitials = getInitials(myUserName);
      bubbleBgClasses = ["bg-blue-600"];
      bubbleTextClasses = ["text-white"];
      bubbleRoundedClass = "rounded-br-sm";
      break;
    case "other": // Pesan publik dari orang lain
      displaySenderName = sender;
      avatarInitials = getInitials(sender);
      bubbleBgClasses = ["bg-gray-200"];
      bubbleTextClasses = ["text-gray-800"];
      bubbleRoundedClass = "rounded-bl-sm";
      break;
    case "private": // Pesan pribadi yang Anda terima
      displaySenderName = `PRIBADI dari ${sender}`;
      avatarInitials = getInitials(sender);
      bubbleBgClasses = ["bg-yellow-100"];
      bubbleTextClasses = ["text-yellow-800"];
      borderColorClasses = ["border", "border-yellow-300"];
      bubbleRoundedClass = "rounded-bl-sm";
      break;
    case "private_message_sent_echo": // Pesan pribadi yang Anda kirim (echo dari server)
      displaySenderName = `Pribadi ke ${sender}`; // sender di sini adalah nama penerima
      avatarInitials = getInitials(myUserName);
      bubbleBgClasses = ["bg-yellow-200"];
      bubbleTextClasses = ["text-yellow-900"];
      borderColorClasses = ["border", "border-yellow-400"];
      bubbleRoundedClass = "rounded-br-sm";
      break;
    case "group_message": // Pesan grup
      // Jika pesan grup dari saya
      if (sender === myUserName) {
        displaySenderName = `Anda (#${groupName})`;
        avatarInitials = getInitials(myUserName);
        bubbleBgClasses = ["bg-green-600"];
        bubbleTextClasses = ["text-white"];
        bubbleRoundedClass = "rounded-br-sm";
      } else {
        // Jika pesan grup dari orang lain
        displaySenderName = `${sender} (#${groupName})`;
        avatarInitials = getInitials(sender);
        bubbleBgClasses = ["bg-green-100"];
        bubbleTextClasses = ["text-green-800"];
        bubbleRoundedClass = "rounded-bl-sm";
      }
      break;
    default:
      displaySenderName = sender;
      avatarInitials = getInitials(sender);
      bubbleBgClasses = ["bg-gray-200"];
      bubbleTextClasses = ["text-gray-800"];
      bubbleRoundedClass = "rounded-bl-sm";
      break;
  }

  avatarDiv.textContent = avatarInitials;
  senderNameSpan.textContent = displaySenderName;

  avatarNameContainer.appendChild(avatarDiv);
  avatarNameContainer.appendChild(senderNameSpan);

  const messageContentDiv = document.createElement("div");
  messageContentDiv.classList.add(
    "p-3",
    "rounded-2xl",
    "leading-tight",
    "shadow-sm",
    "text-sm",
    ...bubbleBgClasses,
    ...bubbleTextClasses,
    bubbleRoundedClass,
    ...borderColorClasses
  );

  const contentP = document.createElement("p");
  contentP.textContent = content;

  messageContentDiv.appendChild(contentP);

  if (isMyMessage) {
    messageContainer.appendChild(messageContentDiv);
    messageContainer.appendChild(avatarNameContainer);
  } else {
    messageContainer.appendChild(avatarNameContainer);
    messageContainer.appendChild(messageContentDiv);
  }

  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Menambahkan pesan sistem ke kotak chat.
 * @param {string} message - Isi pesan sistem.
 */
export function addSystemMessage(message) {
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

/**
 * Memperbarui daftar pengguna online.
 * @param {string[]} users - Array nama pengguna online.
 */
export function updateUserList(users) {
  userList.innerHTML = "";

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
  allOption.innerHTML = `
        <div class="user-avatar-placeholder bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            ALL
        </div>
        <span>Semua (Public Chat)</span>`;
  userList.appendChild(allOption);

  // Terapkan kelas 'selected' jika 'all' adalah currentRecipient
  // Perhatikan bahwa currentRecipient bisa berupa '#groupname'
  const isAllSelected = currentRecipient === "all";
  if (isAllSelected) {
    allOption.classList.add("bg-blue-500", "text-white", "selected");
    allOption.classList.remove("text-gray-700", "hover:bg-gray-100");
  } else {
    allOption.classList.add("text-gray-700", "hover:bg-gray-100");
    allOption.classList.remove("bg-blue-500", "text-white", "selected");
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

      const colorData = stringToColor(user);
      const initials = getInitials(user);

      li.innerHTML = `
                <div class="user-avatar-placeholder w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3"
                     style="background-color: ${colorData.bgColor}; color: ${colorData.textColor};">
                    ${initials}
                </div>
                <span>${user}</span>`;

      // Periksa apakah user ini adalah currentRecipient yang sedang dipilih
      if (currentRecipient === user) {
        li.classList.add("bg-blue-500", "text-white", "selected");
        li.classList.remove("text-gray-700", "hover:bg-gray-100");
      } else {
        li.classList.add("text-gray-700", "hover:bg-gray-100");
        li.classList.remove("bg-blue-500", "text-white", "selected");
      }
      userList.appendChild(li);
    }
  });
}

/**
 * Memperbarui daftar riwayat pengguna.
 * @param {string[]} history - Array nama pengguna dalam riwayat.
 */
export function updateUserHistory(history) {
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
      "shadow-sm"
    );

    const colorData = stringToColor(user);
    span.style.backgroundColor = colorData.bgColor;
    span.style.color = colorData.textColor;
    span.textContent = user;
    userHistoryTags.appendChild(span);
  });
}

// --- BARU: Fungsi untuk memperbarui daftar grup yang tersedia ---
/**
 * Memperbarui daftar grup yang tersedia.
 * @param {string[]} groupsArray - Array nama grup yang tersedia.
 */
export function updateAvailableGroups(groupsArray) {
  groupList.innerHTML = ""; // Hapus grup yang ada (kecuali 'public' jika Anda selalu menampilkannya)

  // Pastikan grup 'public' selalu ada dan terpilih secara default
  const publicGroupExists = groupsArray.includes("public");
  if (!publicGroupExists) {
    groupsArray.unshift("public"); // Tambahkan 'public' ke awal jika tidak ada (untuk memastikan)
  }

  groupsArray.forEach((groupName) => {
    const li = document.createElement("li");
    li.dataset.group = groupName;
    li.classList.add(
      "flex",
      "flex-col",
      "p-3",
      "cursor-pointer",
      "rounded-md",
      "mb-2",
      "font-medium",
      "transition",
      "duration-200"
    );

    // --- BARU: Konten LI untuk Grup ---
    // Buat div untuk nama grup dan avatar
    const groupNameDisplay = document.createElement("div");
    groupNameDisplay.classList.add("flex", "items-center", "mb-2"); // Margin bawah untuk tombol Join/Leave

    const avatarPlaceholder = document.createElement("div");
    avatarPlaceholder.classList.add(
      "user-avatar-placeholder",
      "bg-gray-400",
      "text-white",
      "w-8",
      "h-8",
      "rounded-full",
      "flex",
      "items-center",
      "justify-center",
      "text-sm",
      "font-semibold",
      "mr-3"
    );
    avatarPlaceholder.textContent = "#"; // Inisial grup

    const groupNameSpan = document.createElement("span");
    groupNameSpan.textContent = groupName;

    groupNameDisplay.appendChild(avatarPlaceholder);
    groupNameDisplay.appendChild(groupNameSpan);
    li.appendChild(groupNameDisplay);

    // Tombol Join/Leave Grup
    const joinLeaveButton = document.createElement("button");
    joinLeaveButton.classList.add(
      "px-3",
      "py-1",
      "rounded-md",
      "text-xs",
      "font-semibold",
      "transition",
      "duration-200"
    );
    joinLeaveButton.dataset.groupAction = groupName; // Untuk event listener

    // Status keanggotaan grup perlu diketahui dari server
    // Saat ini server belum mengirim data keanggotaan user di semua grup.
    // Untuk sementara, kita bisa berasumsi dan nanti perbaiki server.
    // Asumsi sementara: kalau saya tidak di grup itu, tampilkan Join.
    // Nantinya: Server harus mengirim data 'group_members_update' dan klien harus memprosesnya.

    // Untuk saat ini, kita akan membuat tombolnya selalu ada
    // dan logikanya bisa diperbaiki lebih lanjut setelah data keanggotaan dari server tersedia.
    // Kita perlu tahu 'myUserName' adalah member dari 'groupName' atau tidak.
    // Ini berarti kita perlu data 'groupMembers' di scope ui.js.
    // Untuk tujuan demonstrasi fitur Join, kita akan tampilkan tombol Join saja.

    // Logika untuk menampilkan Join/Leave
    // Kita akan menggunakan 'group_members_update' yang dikirim server
    // untuk menentukan apakah user adalah anggota grup.
    // Karena data 'groupMembers' hanya ada di `websocket.js` saat ini,
    // kita perlu cara untuk menyampaikannya ke `ui.js` atau membuatnya global di `constants.js`.
    // Untuk penyelesaian cepat, saya akan tambahkan `currentGroupMembers` global.

    let isMember = false; // Akan diisi dari data global groupMembers (lihat constants.js)
    // Logika ini akan diperbaiki setelah kita punya currentGroupMembers
    // if (globalGroupMembers && globalGroupMembers[groupName] && globalGroupMembers[groupName].includes(myUserName)) {
    //     isMember = true;
    // }

    // Placeholder untuk logic isMember
    // Untuk demo cepat, kita akan selalu tampilkan tombol Join
    // Atau, jika ini grup 'public', anggap kita selalu anggota
    if (
      groupName === "public" ||
      (window.currentGroupMembers &&
        window.currentGroupMembers[groupName] &&
        window.currentGroupMembers[groupName].includes(myUserName))
    ) {
      isMember = true;
    }

    if (isMember) {
      joinLeaveButton.textContent = "Tinggalkan";
      joinLeaveButton.classList.add(
        "bg-red-500",
        "text-white",
        "hover:bg-red-600"
      );
      joinLeaveButton.dataset.actionType = "leave";
    } else {
      joinLeaveButton.textContent = "Gabung";
      joinLeaveButton.classList.add(
        "bg-green-500",
        "text-white",
        "hover:bg-green-600"
      );
      joinLeaveButton.dataset.actionType = "join";
    }

    // Jangan tampilkan tombol Leave untuk grup 'public'
    if (groupName === "public") {
      joinLeaveButton.style.display = "none";
    }

    li.appendChild(joinLeaveButton);
    // --- AKHIR BARU ---

    // Terapkan kelas 'selected' jika grup ini adalah currentRecipient yang sedang dipilih
    const isSelected = currentRecipient === `#${groupName}`;
    if (isSelected) {
      li.classList.add("bg-blue-500", "text-white", "selected");
      li.classList.remove("text-gray-700", "hover:bg-gray-100");
    } else {
      li.classList.add("text-gray-700", "hover:bg-gray-100");
      li.classList.remove("bg-blue-500", "text-white", "selected");
    }
    groupList.appendChild(li);
  });
}

/**
 * Mengatur status input pengguna (enable/disable).
 * @param {boolean} disabled - True untuk menonaktifkan, false untuk mengaktifkan.
 */
export function setUserInputState(disabled) {
  userNameInput.disabled = disabled;
  setUserNameButton.disabled = disabled;
  messageInput.disabled = !disabled;
  sendButton.disabled = !disabled;
  groupNameInput.disabled = !disabled; // BARU: Enable/disable input grup
  createGroupButton.disabled = !disabled; // BARU: Enable/disable tombol buat grup
}

/**
 * Mereset informasi pengguna saat terputus.
 */
export function resetUserInfo() {
  currentUserInfo.textContent = "";
  userNameInput.value = ""; // Hapus input nama
}
