// public/assets/js/eventHandlers.js

import {
  setUserNameButton,
  messageInput,
  sendButton,
  userList,
  userNameInput,
  currentUserInfo,
  currentRecipientSpan,
  groupNameInput,
  createGroupButton,
  groupList,
} from "./domElements.js";
import {
  setMyUserName,
  setCurrentRecipient,
  myUserName,
  currentRecipient,
  ws,
} from "./constants.js";
import {
  connectWebSocket,
  sendMessageToServer,
  createGroup,
  joinGroup,
  leaveGroup,
} from "./websocket.js"; // Import fungsi grup baru
import {
  addSystemMessage,
  updateUserList,
  setUserInputState,
  updateAvailableGroups,
} from "./ui.js";

/**
 * Menyiapkan semua event listeners di aplikasi.
 */
export function setupEventListeners() {
  setUserNameButton.addEventListener("click", () => {
    const userName = userNameInput.value.trim();
    if (userName) {
      setMyUserName(userName);

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(`init_user:${myUserName}`);
      } else {
        connectWebSocket();
      }

      setUserInputState(true);
      currentUserInfo.textContent = `Anda: ${myUserName}`;
    } else {
      alert("Nama pengguna tidak boleh kosong!");
    }
  });

  sendButton.addEventListener("click", () =>
    sendMessageToServer(messageInput.value)
  );

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessageToServer(messageInput.value);
  });

  // Event listener untuk memilih USER
  userList.addEventListener("click", (e) => {
    const targetLi = e.target.closest("li");
    if (targetLi && targetLi.dataset.user) {
      // Hapus seleksi dari daftar grup (jika ada)
      const currentSelectedGroup = groupList.querySelector(".selected");
      if (currentSelectedGroup)
        currentSelectedGroup.classList.remove("selected");

      const currentSelectedUser = userList.querySelector(".selected");
      if (currentSelectedUser) currentSelectedUser.classList.remove("selected");

      targetLi.classList.add("selected");

      setCurrentRecipient(targetLi.dataset.user);
      currentRecipientSpan.textContent =
        currentRecipient === "all" ? "Semua" : currentRecipient;
      addSystemMessage(
        `Anda sekarang mengirim pesan ke: ${
          currentRecipient === "all" ? "Semua" : currentRecipient
        }`
      );

      // Re-render user list for correct selection styling (optional if server sends updates)
      const currentOnlineUsersFromDOM = Array.from(
        userList.querySelectorAll('li[data-user]:not([data-user="all"])')
      ).map((li) => li.dataset.user);
      updateUserList(currentOnlineUsersFromDOM);
      // Re-render group list to ensure no group is selected
      const currentGroupsFromDOM = Array.from(
        groupList.querySelectorAll("li[data-group]")
      ).map((li) => li.dataset.group);
      updateAvailableGroups(currentGroupsFromDOM);
    }
  });

  // --- BARU: Event Listeners untuk Grup ---

  // Event listener untuk tombol 'Buat Grup'
  createGroupButton.addEventListener("click", () => {
    const groupName = groupNameInput.value.trim();
    if (groupName) {
      createGroup(groupName);
      groupNameInput.value = ""; // Kosongkan input
    } else {
      alert("Nama grup tidak boleh kosong!");
    }
  });

  // Event listener untuk memilih GROUP
  groupList.addEventListener("click", (e) => {
    const targetLi = e.target.closest("li");
    if (targetLi && targetLi.dataset.group) {
      const selectedGroupName = targetLi.dataset.group;

      // Hapus seleksi dari daftar user (jika ada)
      const currentSelectedUser = userList.querySelector(".selected");
      if (currentSelectedUser) currentSelectedUser.classList.remove("selected");

      const currentSelectedGroup = groupList.querySelector(".selected");
      if (currentSelectedGroup)
        currentSelectedGroup.classList.remove("selected");

      targetLi.classList.add("selected"); // Tambahkan kelas selected ke grup yang diklik

      setCurrentRecipient(`#${selectedGroupName}`); // Set recipient ke format grup
      currentRecipientSpan.textContent = `#${selectedGroupName}`;
      addSystemMessage(
        `Anda sekarang mengirim pesan ke grup: #${selectedGroupName}`
      );

      // Otomatis gabung grup saat dipilih (jika belum anggota)
      // Anda bisa tambahkan ini atau membuat tombol join terpisah
      // joinGroup(selectedGroupName); // Ini akan memicu notifikasi join

      // Re-render group list for correct selection styling
      const currentGroupsFromDOM = Array.from(
        groupList.querySelectorAll("li[data-group]")
      ).map((li) => li.dataset.group);
      updateAvailableGroups(currentGroupsFromDOM);
      // Re-render user list to ensure no user is selected
      const currentOnlineUsersFromDOM = Array.from(
        userList.querySelectorAll('li[data-user]:not([data-user="all"])')
      ).map((li) => li.dataset.user);
      updateUserList(currentOnlineUsersFromDOM);
    }
  });

  groupList.addEventListener("click", (e) => {
    const targetButton = e.target.closest("button[data-group-action]");
    if (targetButton) {
      const groupName = targetButton.dataset.groupAction;
      const actionType = targetButton.dataset.actionType;

      if (actionType === "join") {
        joinGroup(groupName);
      } else if (actionType === "leave") {
        leaveGroup(groupName);
      }
      // Hentikan propagasi event agar tidak memicu pemilihan grup
      e.stopPropagation();
      return;
    }

    // Event listener untuk memilih GROUP (yang sudah ada)
    const targetLi = e.target.closest("li[data-group]"); // Pastikan hanya li grup yang diklik, bukan tombol di dalamnya
    if (targetLi) {
      const selectedGroupName = targetLi.dataset.group;

      // ... (logika pemilihan grup yang sudah ada) ...
      // Hapus seleksi dari daftar user (jika ada)
      const currentSelectedUser = userList.querySelector(".selected");
      if (currentSelectedUser) currentSelectedUser.classList.remove("selected");

      const currentSelectedGroup = groupList.querySelector(".selected");
      if (currentSelectedGroup)
        currentSelectedGroup.classList.remove("selected");

      targetLi.classList.add("selected"); // Tambahkan kelas selected ke grup yang diklik

      setCurrentRecipient(`#${selectedGroupName}`); // Set recipient ke format grup
      currentRecipientSpan.textContent = `#${selectedGroupName}`;
      addSystemMessage(
        `Anda sekarang mengirim pesan ke grup: #${selectedGroupName}`
      );

      // Re-render user list to ensure no user is selected
      const currentOnlineUsersFromDOM = Array.from(
        userList.querySelectorAll('li[data-user]:not([data-user="all"])')
      ).map((li) => li.dataset.user);
      updateUserList(currentOnlineUsersFromDOM);

      // Re-render group list for correct selection styling
      const currentGroupsFromDOM = Array.from(
        groupList.querySelectorAll("li[data-group]")
      ).map((li) => li.dataset.group);
      updateAvailableGroups(currentGroupsFromDOM);
    }
  });
}
