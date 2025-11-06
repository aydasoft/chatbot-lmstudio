// Configuração da API
export let API_BASE_URL = 'http://127.0.0.1:1234/v1';

// Estado da aplicação
export let currentModel = null;
export let currentConversationId = null;
export let conversations = [];
export let isLoading = false;
export let autoScroll = true;
export let temperature = 0.7;
export let maxTokens = 2048;
export let isConnected = false;
export let dbInstance = null;

// Funções "setter" para atualizar o estado
export function setCurrentModel(val) { currentModel = val; }
export function setCurrentConversationId(val) { currentConversationId = val; }
export function setConversations(val) { conversations = val; }
export function setIsLoading(val) { isLoading = val; }
export function setAutoScroll(val) { autoScroll = val; }
export function setTemperature(val) { temperature = val; }
export function setMaxTokens(val) { maxTokens = val; }
export function setIsConnected(val) { isConnected = val; }
export function setDbInstance(val) { dbInstance = val; }

// Elementos DOM
export const sidebar = document.getElementById('sidebar');
export const sidebarOverlay = document.getElementById('sidebarOverlay');
export const hamburgerBtn = document.getElementById('hamburgerBtn');
export const closeSidebar = document.getElementById('closeSidebar');
export const mainContent = document.getElementById('mainContent');
export const modelsContainer = document.getElementById('modelsContainer');
export const conversationsContainer = document.getElementById('conversationsContainer');
export const chatContainer = document.getElementById('chatContainer');
export const messageInput = document.getElementById('messageInput');
export const sendButton = document.getElementById('sendButton');
export const newChatBtn = document.getElementById('newChatBtn');
export const currentModelEl = document.getElementById('currentModel');
export const currentConversationEl = document.getElementById('currentConversation');
export const emptyState = document.getElementById('emptyState');
export const exportBtn = document.getElementById('exportBtn');
export const settingsBtn = document.getElementById('settingsBtn');
export const toast = document.getElementById('toast');
export const toastMessage = document.getElementById('toastMessage');
export const toastIcon = document.getElementById('toastIcon');
export const importBtn = document.getElementById('importBtn');
export const importFile = document.getElementById('importFile');
export const temperatureInput = document.getElementById('temperature');
export const tempValue = document.getElementById('tempValue');
export const maxTokensInput = document.getElementById('maxTokens');
export const modelStatus = document.getElementById('modelStatus');
export const connectionStatus = document.getElementById('connectionStatus');
export const connectionText = document.getElementById('connectionText');
