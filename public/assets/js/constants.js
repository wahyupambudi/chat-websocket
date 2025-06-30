// public/assets/js/constants.js

export let ws = null; // WebSocket instance
export let myUserName = "";
export let currentRecipient = "all"; // Default recipient

// Setter functions to allow other modules to update these values
export function setWs(newWs) {
    ws = newWs;
}

export function setMyUserName(newName) {
    myUserName = newName;
}

export function setCurrentRecipient(newRecipient) {
    currentRecipient = newRecipient;
}