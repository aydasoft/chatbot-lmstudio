// ===== Traduções =====
const translations = {
    "pt-BR": {
        sidebar: {
            models: "Modelos Disponíveis",
            conversations: "Conversas",
            newChat: "Nova Conversa",
            exportChat: "Exportar conversa",
            importChat: "Importar conversa",
            noConversations: "Nenhuma conversa salva",
            loadingModels: "Carregando modelos...",
            settings: "Configurações",
            temperature: "Temperatura",
            maxTokens: "Máx. Tokens"
        },
        main: {
            selectModel: "Selecione um modelo",
            noConversation: "Nenhuma conversa ativa",
            welcomeTitle: "Bem-vindo ao ADAChat!",
            welcomeText: "Selecione um modelo e comece uma conversa para explorar as capacidades avançadas da IA.",
            connecting: "Conectando ao ADAChat...",
            placeholder: "Digite sua mensagem..."
        }
    },
    "en-US": {
        sidebar: {
            models: "Available Models",
            conversations: "Conversations",
            newChat: "New Chat",
            exportChat: "Export chat",
            importChat: "Import chat",
            noConversations: "No saved conversations",
            loadingModels: "Loading models...",
            settings: "Settings",
            temperature: "Temperature",
            maxTokens: "Max Tokens"
        },
        main: {
            selectModel: "Select a model",
            noConversation: "No active conversation",
            welcomeTitle: "Welcome to ADAChat!",
            welcomeText: "Select a model and start chatting to explore advanced AI capabilities.",
            connecting: "Connecting to ADAChat...",
            placeholder: "Type your message..."
        }
    }
};

// ===== Funções de Idioma =====
const languageSelect = document.getElementById("languageSelect");

languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    applyLanguage(lang);
    localStorage.setItem("ada_language", lang);
});

function applyLanguage(lang) {
    const t = translations[lang];

    // Sidebar
    document.querySelector('.models-section .section-title').innerHTML = `<i>🧠</i> ${t.sidebar.models}`;
    document.querySelector('.conversations-section .section-title').innerHTML = `<i>💬</i> ${t.sidebar.conversations}`;
    document.getElementById('newChatBtn').innerHTML = `<i>+</i> ${t.sidebar.newChat}`;
    document.getElementById('exportBtn').innerHTML = `<i>📤</i> ${t.sidebar.exportChat}`;
    document.getElementById('importBtn').innerHTML = `<i>📥</i> ${t.sidebar.importChat}`;
    document.querySelector('.settings-section .section-title').innerHTML = `<i>⚙️</i> ${t.sidebar.settings}`;

    // === Corrigido: busca direta por posição ===
    const settingLabels = document.querySelectorAll('.settings-section .setting-label');
    if (settingLabels[0]) settingLabels[0].textContent = t.sidebar.temperature;
    if (settingLabels[1]) settingLabels[1].textContent = t.sidebar.maxTokens;

    // Modelos e conversas vazios
    const modelsContainer = document.getElementById("modelsContainer");
    if (modelsContainer && (modelsContainer.textContent.includes("Carregando") || modelsContainer.textContent.includes("Loading"))) {
        modelsContainer.innerHTML = `<div class="text-center text-white-50">${t.sidebar.loadingModels}</div>`;
    }

    const convContainer = document.getElementById("conversationsContainer");
    if (convContainer && (convContainer.textContent.includes("Nenhuma") || convContainer.textContent.includes("No saved"))) {
        convContainer.innerHTML = `<div class="text-center text-white-50">${t.sidebar.noConversations}</div>`;
    }

    // Main Content
    const currentModel = document.getElementById("currentModel");
    if (currentModel)
        currentModel.innerHTML = `<span class="model-status" id="modelStatus"></span> ${t.main.selectModel}`;

    const currentConv = document.getElementById("currentConversation");
    if (currentConv)
        currentConv.textContent = t.main.noConversation;

    const emptyState = document.getElementById("emptyState");
    if (emptyState) {
        emptyState.querySelector("h4").textContent = t.main.welcomeTitle;
        emptyState.querySelector("p").textContent = t.main.welcomeText;
    }

    const connText = document.getElementById("connectionText");
    if (connText) connText.textContent = t.main.connecting;

    const msgInput = document.getElementById("messageInput");
    if (msgInput) msgInput.placeholder = t.main.placeholder;
}

// ===== Ao carregar a página =====
window.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("ada_language") || "pt-BR";
    languageSelect.value = savedLang;
    applyLanguage(savedLang);
});

