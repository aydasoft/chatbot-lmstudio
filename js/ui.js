import * as config from './config.js';
import * as handlers from './handlers.js';
import { formatMessage } from './utils.js';

// Toggle sidebar
export function toggleSidebar() {
    config.sidebar.classList.toggle('show');
    config.sidebarOverlay.classList.toggle('show');
    if (config.sidebar.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Renderizar modelos
export function renderModels(models) {
    if (models.length === 0) {
        config.modelsContainer.innerHTML = '<div class="text-white-50 p-2">Nenhum modelo encontrado</div>';
        return;
    }
    
    config.modelsContainer.innerHTML = models.map(model => `
<div class="model-item ${config.currentModel === model.id ? 'active' : ''}" 
     data-model="${model.id}">
    <strong>${model.id}</strong>
    <div class="model-info text-white-50 mt-1">
        ${model.object || 'Modelo'} 
        <span class="model-badge">${model.owned_by || 'local'}</span>
    </div>
</div>
    `).join('');
    
    // Adicionar evento de clique aos modelos
    document.querySelectorAll('.model-item').forEach(item => {
        item.addEventListener('click', () => {
            handlers.selectModel(item.dataset.model);
            toggleSidebar();
        });
    });
}

// Renderizar conversas
export function renderConversations() {
    if (config.conversations.length === 0) {
        config.conversationsContainer.innerHTML = '<div class="text-center text-white-50 p-2">Nenhuma conversa salva</div>';
        return;
    }

    config.conversationsContainer.innerHTML = config.conversations.map(conv => `
<div class="conversation-item ${config.currentConversationId === conv.id ? 'active' : ''}" 
     data-id="${conv.id}">
    <div class="d-flex justify-content-between align-items-start">
        <span class="flex-grow-1 me-2 conv-title">${conv.title}</span>

        <div class="menu-wrapper">
            <button class="menu-btn" title="Opções" data-id="${conv.id}">⋮</button>
            <div class="menu-options" id="menu-${conv.id}">
                <div class="menu-option rename" data-id="${conv.id}">✏️ Renomear</div>
                <div class="menu-option delete" data-id="${conv.id}">🗑️ Excluir</div>
            </div>
        </div>
    </div>
    <div class="text-white-50 mt-1" style="font-size: 0.75rem;">
        ${conv.model || 'Sem modelo'} • ${new Date(conv.createdAt).toLocaleDateString('pt-BR')}
    </div>
</div>
    `).join('');
}

export function renderMessages(messages) {
    if (messages.length === 0) {
        config.emptyState.style.display = 'block';
        config.chatContainer.innerHTML = '';
        return;
    }

    config.emptyState.style.display = 'none';
    config.chatContainer.innerHTML = messages.map((msg, index) => `
<div class="message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}" data-index="${index}">
    <div class="message-header">
        <div class="message-role">
            ${msg.role === 'user' ? 'Você' : 'ADA'}
        </div>
        <div class="message-time">
            ${new Date(msg.timestamp || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
    </div>
    <div class="message-content">${renderMessageContent(msg.content)}</div>
    ${msg.role === 'assistant' ? `
<button class="copy-btn" data-index="${index}">Copiar</button>
    ` : ''}
</div>
    `).join('');

    // Aplicar syntax highlighting
    document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });

    if (config.autoScroll) {
        config.chatContainer.scrollTop = config.chatContainer.scrollHeight;
    }

}

// Formatar mensagem com suporte multimodal
export function renderMessageContent(content) {
    if (typeof content === 'string') {
        return formatMessage(content);
    }

    if (Array.isArray(content)) {
        return content.map(item => {
            if (item.type === 'text') {
                return formatMessage(item.text);
            } else if (item.type === 'image_url') {
                const imgUrl = item.image_url?.url || item.image_url;
                return `<img src="${imgUrl}" alt="Imagem enviada" class="chat-image" />`;
            } else {
                return `[Tipo desconhecido: ${item.type}]`;
            }
        }).join('<br>');
    }

    return '[Conteúdo inválido]';
}

const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');

// Ao selecionar imagem, mostra a miniatura
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    previewContainer.innerHTML = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewContainer.innerHTML = `
      <img src="${e.target.result}" title="${file.name}" alt="Prévia da imagem" />
    `;
  };
  reader.readAsDataURL(file);
});

// Quando enviar a mensagem, limpa a miniatura
sendButton.addEventListener('click', () => {
  previewContainer.innerHTML = '';
});

