// public/assets/js/ui.js

import { chatBox, messageInput, sendButton, userNameInput, setUserNameButton, currentUserInfo, currentRecipientSpan, userList, userHistoryTags } from './domElements.js';
import { myUserName, currentRecipient, setMyUserName, setCurrentRecipient } from './constants.js';
import { getInitials, stringToColor } from './utils.js';

/**
 * Menambahkan pesan ke kotak chat.
 * @param {string} sender - Nama pengirim.
 * @param {string} content - Isi pesan.
 * @param {string} type - Tipe pesan ('self', 'other', 'private', 'system').
 */
export function addMessage(sender, content, type = 'other') {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("flex", "mb-2", "items-end", "max-w-[90%]");

    // Untuk pesan yang dikirim sendiri (self atau self private), tata letak avatar dan nama ada di kanan
    if (type === "self" || type.includes("self private")) { // Tambahkan kondisi self private
        messageContainer.classList.add("ml-auto", "justify-end");
    } else {
        messageContainer.classList.add("mr-auto", "justify-start");
    }

    const avatarNameContainer = document.createElement("div");
    avatarNameContainer.classList.add(
        "flex", "flex-col", "items-center", "text-center", "mx-2", "flex-shrink-0"
    );

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add(
        "user-avatar-placeholder", "w-8", "h-8", "rounded-full", "flex", "items-center",
        "justify-center", "text-sm", "font-bold", "bg-gray-300", "text-gray-800"
    ); 

    const senderNameSpan = document.createElement("span");
    senderNameSpan.classList.add(
        "text-xs", "text-gray-600", "mt-1", "max-w-[60px]", "truncate"
    ); 

    // Tentukan inisial dan nama pengirim yang ditampilkan
    let displaySenderName = sender;
    let avatarInitials = getInitials(sender);

    if (type === "self") { // Ini untuk pesan publik Anda sendiri
        displaySenderName = "Anda";
        avatarInitials = getInitials(myUserName); // Gunakan inisial Anda
    } else if (type === "private_message_sent") { // Ini untuk pesan pribadi yang Anda kirim
        displaySenderName = `${sender} (Pribadi Anda)`; // Sender di sini adalah recipient sebenarnya dari data.recipient
        avatarInitials = getInitials(myUserName); // Gunakan inisial Anda
        type = "self private"; // Mengubah type agar styling yang sama bisa diterapkan
    } else if (type === "private") { // Ini untuk pesan pribadi yang Anda terima
        displaySenderName = `PRIBADI dari ${sender}`;
    }

    avatarDiv.textContent = avatarInitials;
    senderNameSpan.textContent = displaySenderName;

    avatarNameContainer.appendChild(avatarDiv);
    avatarNameContainer.appendChild(senderNameSpan);

    const messageContentDiv = document.createElement("div");
    messageContentDiv.classList.add(
        "p-3", "rounded-2xl", "leading-tight", "shadow-sm", "text-sm"
    );

    const contentP = document.createElement("p");
    contentP.textContent = content;

    // Tentukan gaya gelembung pesan
    if (type === "self") { // Pesan publik Anda
        messageContentDiv.classList.add("bg-blue-600", "text-white", "rounded-br-sm");
    } else if (type === "other") { // Pesan publik orang lain
        messageContentDiv.classList.add("bg-gray-200", "text-gray-800", "rounded-bl-sm");
    } else if (type === "private") { // Pesan pribadi yang diterima
        messageContentDiv.classList.add("bg-yellow-100", "text-yellow-800", "border", "border-yellow-300", "rounded-bl-sm");
    } else if (type === "self private") { // Pesan pribadi yang Anda kirim
         messageContentDiv.classList.add("bg-yellow-200", "text-yellow-900", "border", "border-yellow-400", "rounded-br-sm"); // Warna berbeda untuk pribadi Anda
    }

    messageContentDiv.appendChild(contentP);

    // Atur urutan elemen berdasarkan tipe pesan
    if (type === "self" || type === "self private") { // Untuk pesan Anda sendiri (publik atau pribadi)
        messageContainer.appendChild(messageContentDiv);
        messageContainer.appendChild(avatarNameContainer);
    } else if (type === "other" || type === "private") { // Untuk pesan orang lain (publik atau pribadi)
        messageContainer.appendChild(avatarNameContainer);
        messageContainer.appendChild(messageContentDiv);
    }
    // Pesan sistem tidak perlu avatar

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
        "text-gray-500", "italic", "text-xs", "text-center", "px-3", "py-1",
        "rounded-full", "bg-gray-100", "max-w-md"
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
        "flex", "items-center", "p-3", "cursor-pointer", "rounded-md", "mb-2",
        "font-medium", "transition", "duration-200"
    );
    allOption.innerHTML = `
        <div class="user-avatar-placeholder bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
            ALL
        </div>
        <span>Semua (Public Chat)</span>`;
    userList.appendChild(allOption);

    if (currentRecipient === "all") {
        allOption.classList.remove("bg-blue-500", "text-white", "selected");
        allOption.classList.add("text-gray-700", "hover:bg-gray-100");
    } else {
        allOption.classList.add("text-gray-700", "hover:bg-gray-100");
        allOption.classList.remove("bg-blue-500", "text-white", "selected");
    }

    users.forEach((user) => {
        if (user !== myUserName) {
            const li = document.createElement("li");
            li.dataset.user = user;
            li.classList.add(
                "flex", "items-center", "p-3", "cursor-pointer", "rounded-md", "mb-2",
                "font-medium", "transition", "duration-200"
            );
            
            const colorData = stringToColor(user); // Menggunakan stringToColor dari utils
            const initials = getInitials(user); // Menggunakan getInitials dari utils

            li.innerHTML = `
                <div class="user-avatar-placeholder w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3"
                     style="background-color: ${colorData.bgColor}; color: ${colorData.textColor};">
                    ${initials}
                </div>
                <span>${user}</span>`;
            
            if (user === currentRecipient) {
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
            "inline-flex", "items-center", "px-3", "py-1", "rounded-full",
            "text-sm", "font-medium", "shadow-sm"
        );
        
        const colorData = stringToColor(user); // Menggunakan stringToColor dari utils
        span.style.backgroundColor = colorData.bgColor;
        span.style.color = colorData.textColor;
        span.textContent = user;
        userHistoryTags.appendChild(span);
    });
}

/**
 * Mengatur status input pengguna (enable/disable).
 * @param {boolean} disabled - True untuk menonaktifkan, false untuk mengaktifkan.
 */
export function setUserInputState(disabled) {
    userNameInput.disabled = disabled;
    setUserNameButton.disabled = disabled;
    messageInput.disabled = !disabled; // Kebalikan
    sendButton.disabled = !disabled;   // Kebalikan
}

/**
 * Mereset informasi pengguna saat terputus.
 */
export function resetUserInfo() {
    currentUserInfo.textContent = '';
    userNameInput.value = ''; // Hapus input nama
}