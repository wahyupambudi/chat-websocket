// public/assets/js/eventHandlers.js

import { setUserNameButton, messageInput, sendButton, userList, userNameInput, currentUserInfo } from './domElements.js';
import { setMyUserName, setCurrentRecipient, myUserName, currentRecipient, ws } from './constants.js';
import { connectWebSocket, sendMessageToServer } from './websocket.js';
import { addSystemMessage, updateUserList } from './ui.js';

/**
 * Menyiapkan semua event listeners di aplikasi.
 */
export function setupEventListeners() {
    setUserNameButton.addEventListener("click", () => {
        const userName = userNameInput.value.trim();
        if (userName) {
            setMyUserName(userName); // Update global myUserName
            
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(`init_user:${myUserName}`);
            } else {
                connectWebSocket(); // Akan mengirim init_user di onopen jika myUserName sudah diatur
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

    sendButton.addEventListener("click", () => sendMessageToServer(messageInput.value));
    
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessageToServer(messageInput.value);
    });

    userList.addEventListener("click", (e) => {
        const targetLi = e.target.closest("li");
        if (targetLi && targetLi.dataset.user) {
            const currentSelected = userList.querySelector(".selected");
            if (currentSelected) currentSelected.classList.remove("selected");

            targetLi.classList.add("selected");

            setCurrentRecipient(targetLi.dataset.user); // Update global currentRecipient
            currentRecipientSpan.textContent =
                currentRecipient === "all" ? "Semua" : currentRecipient;
            addSystemMessage(
                `Anda sekarang mengirim pesan ke: ${
                    currentRecipient === "all" ? "Semua" : currentRecipient
                }`
            );
            
            // Re-render user list to ensure selection styling is applied consistently
            // This needs to get the current online users.
            // If the user list is frequently updated by the server (via user_list message),
            // this explicit re-render here might be redundant but ensures immediate visual feedback.
            // For simplicity, we'll rely on the 'user_list' message from the server to update.
            // If you want immediate visual update here, you'd need to collect current online users
            // from the DOM and pass them to updateUserList.
        }
    });
}