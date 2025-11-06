import * as config from './config.js';

// Converte arquivo em Base64
export async function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // só o conteúdo base64
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Mostrar toast
export function showToast(message, type = 'info') {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    config.toastIcon.textContent = icons[type] || 'ℹ️';
    config.toastMessage.textContent = message;
    config.toast.className = 'toast ' + type;
    config.toast.classList.add('show');
    
    setTimeout(() => {
        config.toast.classList.remove('show');
    }, 3000);
}

// Formatar mensagem com markdown e syntax highlighting
export function formatMessage(content) {
    // Configurar marked para usar hljs
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-'
    });
    
    return marked.parse(content);
}
