import * as config from './config.js';
import * as api from './api.js';
import * as ui from './ui.js';
import * as storage from './storage.js';
import * as handlers from './handlers.js';

// Configuração de eventos
function setupEventListeners() {
    // Toggle sidebar
    config.hamburgerBtn.addEventListener('click', ui.toggleSidebar);
    config.sidebarOverlay.addEventListener('click', ui.toggleSidebar);
    config.closeSidebar.addEventListener('click', ui.toggleSidebar);
    
    // Novo chat
    config.newChatBtn.addEventListener('click', handlers.createNewConversation);
    
    // Importar conversa
    config.importBtn.addEventListener('click', () => config.importFile.click());
    config.importFile.addEventListener('change', handlers.handleImport);
    
    // Ações do header
    config.exportBtn.addEventListener('click', handlers.exportConversation);
    config.settingsBtn.addEventListener('click', storage.saveSettings);
    
    // Configurações
    config.temperatureInput.addEventListener('input', () => {
        config.tempValue.textContent = config.temperatureInput.value;
    });
    
    // Envio de mensagem
    config.sendButton.addEventListener('click', api.sendMessage);
    config.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            api.sendMessage();
        }
    });
    
    // Auto-resize textarea
    config.messageInput.addEventListener('input', () => {
        config.messageInput.style.height = 'auto';
        config.messageInput.style.height = Math.min(config.messageInput.scrollHeight, 150) + 'px';
    });

    // === AutoScroll inteligente (estilo ChatGPT) ===
    let userNearBottom = true;
    let scrollTimeout;

    // Cria o botão de "Voltar ao final"
    const backToBottomBtn = document.createElement('button');
    backToBottomBtn.textContent = '⬇️ Voltar ao final';
    backToBottomBtn.className = 'back-to-bottom-btn';
    backToBottomBtn.style.display = 'none';
    backToBottomBtn.style.position = 'absolute';
    backToBottomBtn.style.bottom = '80px';
    backToBottomBtn.style.right = '16px';
    backToBottomBtn.style.zIndex = '50';
    backToBottomBtn.style.padding = '8px 14px';
    backToBottomBtn.style.border = 'none';
    backToBottomBtn.style.borderRadius = '20px';
    backToBottomBtn.style.background = '#222';
    backToBottomBtn.style.color = '#fff';
    backToBottomBtn.style.cursor = 'pointer';
    backToBottomBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    backToBottomBtn.style.opacity = '0';
    backToBottomBtn.style.transition = 'opacity 0.25s ease';
    config.chatContainer.parentElement.appendChild(backToBottomBtn);

    // Detectar rolagem manual do usuário
    config.chatContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const container = config.chatContainer;
            const tolerance = 50;

            // Verifica se o usuário está próximo do fim
            const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < tolerance;

            if (!atBottom && userNearBottom) {
                
                console.log("Usuário rolou para cima. Desativando auto-scroll.");
                userNearBottom = false;
                config.setAutoScroll(false);
                backToBottomBtn.style.display = 'block';
                requestAnimationFrame(() => (backToBottomBtn.style.opacity = '1'));
            } 
            else if (atBottom && !userNearBottom) {
                console.log("Usuário voltou ao fundo. Ativando auto-scroll.");
                userNearBottom = true;
                config.setAutoScroll(true);
                backToBottomBtn.style.opacity = '0';
                setTimeout(() => {
                    if (userNearBottom) backToBottomBtn.style.display = 'none';
                }, 250);
            }
        }, 80);
    });

    // Quando o usuário clicar no botão “Voltar ao final”
    backToBottomBtn.addEventListener('click', () => {
        config.chatContainer.scrollTo({
            top: config.chatContainer.scrollHeight,
            behavior: 'smooth'
        });
        config.setAutoScroll(true);
        userNearBottom = true;
        backToBottomBtn.style.opacity = '0';
        setTimeout(() => (backToBottomBtn.style.display = 'none'), 250);
    });

    // === Event Delegation para cliques em listas ===

    // Cliques na lista de conversas (carregar, renomear, deletar)
    config.conversationsContainer.addEventListener('click', (e) => {
        const convItem = e.target.closest('.conversation-item');
        const menuBtn = e.target.closest('.menu-btn');
        const renameBtn = e.target.closest('.menu-option.rename');
        const deleteBtn = e.target.closest('.menu-option.delete');

        // Fechar todos os menus abertos se clicar fora
        if (!menuBtn) {
            document.querySelectorAll('.menu-options').forEach(m => m.classList.remove('show'));
        }

        if (menuBtn) {
            e.stopPropagation();
            const id = menuBtn.dataset.id;
            const menu = document.getElementById(`menu-${id}`);
            const isVisible = menu.classList.contains('show');
            // Fecha todos antes de abrir o novo
            document.querySelectorAll('.menu-options').forEach(m => m.classList.remove('show'));
            if (!isVisible) menu.classList.add('show');
            return;
        }

        if (renameBtn) {
            e.stopPropagation();
            handlers.renameConversation(renameBtn.dataset.id);
            return;
        }

        if (deleteBtn) {
            e.stopPropagation();
            handlers.deleteConversation(deleteBtn.dataset.id);
            return;
        }

        if (convItem) {
            handlers.loadConversation(convItem.dataset.id);
            ui.toggleSidebar();
            return;
        }
    });

    // Fechar menu de conversa ao clicar em qualquer lugar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-wrapper')) {
            document.querySelectorAll('.menu-options').forEach(m => m.classList.remove('show'));
        }
    });

    // Cliques no chat (copiar)
    config.chatContainer.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            handlers.copyMessage(e);
        }
    });
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    storage.loadSettings();
    await api.checkConnection();
    await api.loadModels();

    await storage.loadConversationsIndexedDB();
    ui.renderConversations();
    setupEventListeners();
    
    const activeConversationId = localStorage.getItem('activeConversationId');
    if (activeConversationId) {
        const conversation = config.conversations.find(c => c.id === activeConversationId);
        if (conversation) {
            handlers.loadConversation(conversation.id);
        }
    }
});
