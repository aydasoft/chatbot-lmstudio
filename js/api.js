import * as config from './config.js';
import { showToast, formatMessage, toBase64 } from './utils.js';
import { renderModels, renderMessages } from './ui.js';
import { saveConversations } from './storage.js';
import { updateConversationTitle } from './handlers.js';

// Verificar conexão com o servidor
export async function checkConnection() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 segundos

    try {
        const response = await fetch(`${config.API_BASE_URL}/models`, { signal: controller.signal });

        if (response.ok) {
            config.setIsConnected(true);
            config.connectionStatus.className = 'status-dot';
            config.connectionText.textContent = 'Conectado ao servidor';
            config.modelStatus.className = 'model-status';
        } else {
            throw new Error('Resposta inválida do servidor');
        }

    } catch (error) {
        config.setIsConnected(false);
        config.connectionStatus.className = 'status-dot disconnected';
        config.connectionText.textContent = 'Desconectado do servidor';
        config.modelStatus.className = 'model-status disconnected';

        if (error.name === 'AbortError') {
            showToast('Tempo limite atingido ao conectar ao servidor.', 'warning');
        } else {
            showToast('Não foi possível conectar ao servidor.', 'warning');
        }

    } finally {
        clearTimeout(timeout);
    }
}

// Carregar modelos da API
export async function loadModels() {
    if (!config.isConnected) {
        config.modelsContainer.innerHTML = '<div class="text-danger p-2">Desconectado do servidor</div>';
        return;
    }
    
    try {
        const response = await fetch(`${config.API_BASE_URL}/models`);
        if (!response.ok) throw new Error('Falha ao carregar modelos');

        const data = await response.json();
        renderModels(data.data || []);
    } catch (error) {
        console.error('Erro ao carregar modelos:', error);
        config.modelsContainer.innerHTML = '<div class="text-danger p-2">Erro ao carregar modelos</div>';
        showToast('Erro ao carregar modelos', 'error');
    }
}
  
// Enviar mensagem
export async function sendMessage() {
    const message = config.messageInput.value.trim();
    const imageInput = document.getElementById('imageInput'); // Assumindo que você tem um <input type="file" id="imageInput">
    const file = imageInput?.files?.[0];

    if ((!message && !file) || !config.currentModel || !config.currentConversationId || config.isLoading || !config.isConnected) return;

    const conversation = config.conversations.find(c => c.id === config.currentConversationId);

    let content = [];
    if (message) content.push({ type: "text", text: message });

    if (file) {
        const base64 = await toBase64(file); // toBase64 precisa ser importado de utils
        content.push({
            type: "image_url",
            image_url: { url: `data:${file.type};base64,${base64}` }
        });
        imageInput.value = "";
    }

    const userMessage = {
        role: 'user',
        content,
        timestamp: Date.now()
    };

    conversation.messages.push(userMessage);
    saveConversations();
    renderMessages(conversation.messages);
    updateConversationTitle(config.currentConversationId);
    config.messageInput.value = '';
    config.messageInput.style.height = 'auto';

    const assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
    };
    conversation.messages.push(assistantMessage);
    renderMessages(conversation.messages);

    const lastMsgEl = document.querySelector('.assistant-message:last-child .message-content');

    config.setIsLoading(true);
    config.sendButton.disabled = true;
    config.messageInput.disabled = true;

    try {
        const response = await fetch(`${config.API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: config.currentModel,
                messages: conversation.messages.slice(0, -1),
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                stream: true
            })
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6);
                if (data === '[DONE]') break;

                try {
                    const parsed = JSON.parse(data);
                    const token = parsed.choices?.[0]?.delta?.content || '';
                    if (!token) continue;

                    fullText += token;
                    conversation.messages[conversation.messages.length - 1].content = fullText;
                    
                    if (lastMsgEl) {
                        lastMsgEl.innerHTML = formatMessage(fullText);
                        
                        // Auto-scroll para a última mensagem
                        if (config.setAutoScroll()) {
                            config.chatContainer.scrollTop = config.chatContainer.scrollHeight;
                        }

                        await new Promise(requestAnimationFrame);
                    }
                    
                } catch (err) {
                    // Ignora linhas incompletas ou inválidas no stream
                    if (!data.startsWith('{')) return;
                    console.warn('Chunk parcial ignorado:', data);
                }
            }
        }

        conversation.messages[conversation.messages.length - 1].content = fullText;
        saveConversations();
        renderMessages(conversation.messages); // Renderiza final com highlight
        showToast('Resposta recebida!', 'success');

    } catch (error) {
        console.error('Erro no streaming:', error);
        conversation.messages[conversation.messages.length - 1].content =
            '❌ Ocorreu um erro ao processar a resposta.';
        saveConversations();
        renderMessages(conversation.messages);
        showToast('Erro ao processar mensagem', 'error');
    } finally {
        config.setIsLoading(false);
        config.sendButton.disabled = false;
        config.messageInput.disabled = false;
        config.messageInput.focus();
    }
}
