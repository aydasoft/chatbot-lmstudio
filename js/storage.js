import * as config from './config.js';
import { showToast } from './utils.js';

// === localStorage ===

export function loadSettings() {
    const savedTemp = localStorage.getItem('temperature');
    const savedMaxTokens = localStorage.getItem('maxTokens');
    
    if (savedTemp) {
        config.setTemperature(parseFloat(savedTemp));
        config.temperatureInput.value = config.temperature;
        config.tempValue.textContent = config.temperature;
    }
    
    if (savedMaxTokens) {
        config.setMaxTokens(parseInt(savedMaxTokens));
        config.maxTokensInput.value = config.maxTokens;
    }
}

export function saveSettings() {
    localStorage.setItem('temperature', config.temperatureInput.value);
    localStorage.setItem('maxTokens', config.maxTokensInput.value);
    
    config.setTemperature(parseFloat(config.temperatureInput.value));
    config.setMaxTokens(parseInt(config.maxTokensInput.value));
    config.tempValue.textContent = config.temperature;
    
    showToast('Configurações salvas com sucesso!', 'success');
}

// === IndexedDB ===

export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ChatbotDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('conversations')) {
                db.createObjectStore('conversations', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            config.setDbInstance(request.result);
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function getDB() {
    if (config.dbInstance) return config.dbInstance;
    return await openDatabase();
}

export async function saveConversationsIndexedDB(conversations) {
    const db = await getDB();
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');

    const clearReq = store.clear();
    await new Promise((resolve) => (clearReq.onsuccess = resolve));

    for (const conv of conversations) {
        store.put(conv);
    }

    return tx.complete;
}

export async function loadConversationsIndexedDB() {
    const db = await getDB();
    const tx = db.transaction('conversations', 'readonly');
    const store = tx.objectStore('conversations');
    const request = store.getAll();

    return new Promise((resolve) => {
        request.onsuccess = () => {
            const loadedConversations = request.result || [];
            config.setConversations(loadedConversations);
            resolve(loadedConversations);
        };
        request.onerror = () => resolve([]);
    });
}

// Wrapper principal para salvar
export async function saveConversations() {
    await saveConversationsIndexedDB(config.conversations);
}
