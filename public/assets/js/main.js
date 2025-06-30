// public/assets/js/main.js

import { connectWebSocket } from './websocket.js';
import { setupEventListeners } from './eventHandlers.js';

// Panggil connectWebSocket saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    setupEventListeners();
});