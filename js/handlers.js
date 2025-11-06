import * as config from './config.js';
import { showToast } from './utils.js';
import { saveConversations } from './storage.js';
import { renderConversations, renderMessages, toggleSidebar } from './ui.js';

// Selecionar modelo
export function selectModel(modelId) {
    config.setCurrentModel(modelId);
    document.querySelectorAll('.model-item').forEach(item => {
        item.classList.toggle('active', item.dataset.model === modelId);
    });
    config.currentModelEl.innerHTML = `<span class="model-status"></span> ${modelId}`;
    
    if (config.currentConversationId) {
        config.messageInput.disabled = false;
        config.sendButton.disabled = false;
    }
    
    showToast(`Modelo selecionado: ${modelId}`, 'success');
}

// Criar nova conversa 
export function createNewConversation() {
    if (!config.currentModel) {
        showToast('Selecione um modelo primeiro!', 'error');
        return;
    }

    if (!config.isConnected) {
        showToast('Não conectado ao servidor!', 'warning');
        return;
    }

    const defaultTitle = `Nova conversa ${config.conversations.length + 1}`;

    const newConversation = {
        id: Date.now().toString(),
        title: defaultTitle,
        messages: [],
        model: config.currentModel,
        createdAt: new Date().toISOString(),
        temperature: config.temperature,
        maxTokens: config.maxTokens
    };

    config.conversations.unshift(newConversation);
    saveConversations();
    loadConversation(newConversation.id);
    toggleSidebar();
    showToast('Nova conversa criada!', 'success');
}

// Atualizar título da conversa (baseado na primeira msg)
export function updateConversationTitle(convId) {
    const conv = config.conversations.find(c => c.id === convId);
    if (!conv || conv.messages.length === 0 || conv.title !== `Nova conversa ${config.conversations.length}`) return; // Só atualiza se for o título padrão

    const firstMsg = conv.messages.find(m => m.role === 'user');
    if (firstMsg) {
        let text = '';

        if (typeof firstMsg.content === 'string') {
            text = firstMsg.content.trim();
        } else if (Array.isArray(firstMsg.content)) {
            const textPart = firstMsg.content.find(c => c.type === 'text');
            text = textPart ? textPart.text.trim() : '[Imagem enviada]';
        } else {
            text = '[Mensagem]';
        }

        conv.title = text.length > 40 ? text.substring(0, 37) + '...' : text;
        saveConversations();
        renderConversations();
    }
}


// Carregar conversa
export function loadConversation(conversationId) {
    const conversation = config.conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    config.setCurrentConversationId(conversationId);
    config.setCurrentModel(conversation.model);
    config.currentModelEl.innerHTML = `<span class="model-status"></span> ${conversation.model || 'Modelo não especificado'}`;
    config.currentConversationEl.textContent = conversation.title;
    
    renderConversations();
    renderMessages(conversation.messages);
    
    config.messageInput.disabled = !config.currentModel || !config.isConnected;
    config.sendButton.disabled = !config.currentModel || !config.isConnected;
    
    localStorage.setItem('activeConversationId', conversationId);
}

// Deletar conversa
export function deleteConversation(conversationId) {
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
        const conversationToDelete = config.conversations.find(c => c.id === conversationId);
        config.setConversations(config.conversations.filter(c => c.id !== conversationId));
        saveConversations();

        if (config.currentConversationId === conversationId) {
            config.setCurrentConversationId(null);
            config.setCurrentModel(null);
            config.currentModelEl.innerHTML = '<span class="model-status"></span> Selecione um modelo';
            config.currentConversationEl.textContent = 'Nenhuma conversa ativa';
            renderMessages([]);
            config.messageInput.disabled = true;
            config.sendButton.disabled = true;
            localStorage.removeItem('activeConversationId');
        }

        renderConversations();
        showToast(`Conversa "${conversationToDelete?.title}" excluída!`, 'success');
    }
}

// Renomear conversa
export function renameConversation(conversationId) {
    const conv = config.conversations.find(c => c.id === conversationId);
    const newTitle = prompt('Digite um novo título:', conv.title);
    if (newTitle && newTitle.trim() !== '') {
        conv.title = newTitle.trim();
        saveConversations();
        renderConversations();
        if (config.currentConversationId === conversationId) {
            config.currentConversationEl.textContent = conv.title;
        }
    }
}

// Exportar conversa
export function exportConversation() {
    if (!config.currentConversationId) {
        showToast('Nenhuma conversa ativa para exportar!', 'error');
        return;
    }
    
    const conversation = config.conversations.find(c => c.id === config.currentConversationId);
    if (!conversation) return;
    
    const exportData = {
        title: conversation.title,
        model: conversation.model,
        createdAt: conversation.createdAt,
        messages: conversation.messages,
        temperature: conversation.temperature,
        maxTokens: conversation.maxTokens,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversa-${conversation.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Conversa exportada com sucesso!', 'success');
}

// Importar conversa
export function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            if (!importedData.messages || !Array.isArray(importedData.messages)) {
                throw new Error('Arquivo inválido');
            }
            
            const newConversation = {
                id: Date.now().toString(),
                title: importedData.title || `Importada ${config.conversations.length + 1}`,
                messages: importedData.messages,
                model: importedData.model || config.currentModel || 'modelo-desconhecido',
                createdAt: importedData.createdAt || new Date().toISOString(),
                temperature: importedData.temperature || config.temperature,
                maxTokens: importedData.maxTokens || config.maxTokens
            };
            
            config.conversations.unshift(newConversation);
            saveConversations();
            loadConversation(newConversation.id);
            showToast('Conversa importada com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao importar:', error);
            showToast('Erro ao importar arquivo. Verifique o formato.', 'error');
        }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
}

// Copiar mensagem
export function copyMessage(e) {
    const index = e.target.dataset.index;
    const conversation = config.conversations.find(c => c.id === config.currentConversationId);
    if (!conversation || !conversation.messages[index]) return;
    
    const textToCopy = conversation.messages[index].content;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = e.target.textContent;
        e.target.textContent = 'Copiado!';
        e.target.classList.add('copied');

        setTimeout(() => {
            e.target.textContent = originalText;
            e.target.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        showToast('Erro ao copiar texto', 'error');
    });
}
