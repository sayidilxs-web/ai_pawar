/**
 * 🗄️ NEXUS AI - Database Manager (IndexedDB)
 * Browser Compatible - No Node.js Required
 */
class DatabaseManager {
  constructor() {
    this.dbName = 'NEXUS_AI_Database';
    this.dbVersion = 1;
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('✅ Database initialized');
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.createStores(db);
      };
    });
  }

  createStores(db) {
    if (!db.objectStoreNames.contains('chat_history')) {
      const chatStore = db.createObjectStore('chat_history', { keyPath: 'id', autoIncrement: true });
      chatStore.createIndex('user_id', 'user_id', { unique: false });
      chatStore.createIndex('timestamp', 'timestamp', { unique: false });
    }
    if (!db.objectStoreNames.contains('learning_data')) {
      const learningStore = db.createObjectStore('learning_data', { keyPath: 'id', autoIncrement: true });
      learningStore.createIndex('pattern_type', 'pattern_type', { unique: false });
    }
    if (!db.objectStoreNames.contains('custom_commands')) {
      const cmdStore = db.createObjectStore('custom_commands', { keyPath: 'id', autoIncrement: true });
      cmdStore.createIndex('command_trigger', 'command_trigger', { unique: true });
    }
    if (!db.objectStoreNames.contains('task_history')) {
      db.createObjectStore('task_history', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('qa_knowledge_base')) {
      db.createObjectStore('qa_knowledge_base', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('response_cache')) {
      db.createObjectStore('response_cache', { keyPath: 'id', autoIncrement: true });
    }
    console.log('✅ Database stores created');
  }

  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveChat(userMessage, aiResponse, category = 'general') {
    return await this.add('chat_history', {
      user_id: 'default',
      user_message: userMessage,
      ai_response: aiResponse,
      category: category,
      timestamp: new Date().toISOString()
    });
  }

  async getChatHistory(limit = 50) {
    const all = await this.getAll('chat_history');
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  }

  async saveLearningData(patternType, patternContent, responseTemplate) {
    return await this.add('learning_data', {
      user_id: 'default',
      pattern_type: patternType,
      pattern_content: patternContent,
      response_template: responseTemplate,
      frequency: 1,
      created_at: new Date().toISOString()
    });
  }

  async getLearningData() {
    return await this.getAll('learning_data');
  }

  async addCustomCommand(name, trigger, actionType, actionPayload, description = '') {
    return await this.add('custom_commands', {
      command_name: name,
      command_trigger: trigger,
      action_type: actionType,
      action_payload: JSON.stringify(actionPayload),
      description: description,
      usage_count: 0,
      created_at: new Date().toISOString()
    });
  }

  async findCommand(trigger) {
    const all = await this.getAll('custom_commands');
    return all.find(c => c.command_trigger && c.command_trigger.toLowerCase() === trigger.toLowerCase());
  }

  async saveTask(name, type, status, inputData = {}, outputData = {}) {
    return await this.add('task_history', {
      user_id: 'default',
      task_name: name,
      task_type: type,
      status: status,
      input_data: JSON.stringify(inputData),
      output_data: JSON.stringify(outputData),
      created_at: new Date().toISOString()
    });
  }

  async addQA(question, answer, category = 'general', keywords = []) {
    return await this.add('qa_knowledge_base', {
      user_id: 'default',
      question: question,
      answer: answer,
      category: category,
      keywords: JSON.stringify(keywords),
      created_at: new Date().toISOString()
    });
  }

  async searchQA(query) {
    const all = await this.getAll('qa_knowledge_base');
    const lowerQuery = query.toLowerCase();
    return all.filter(qa => 
      (qa.question && qa.question.toLowerCase().includes(lowerQuery)) ||
      (qa.answer && qa.answer.toLowerCase().includes(lowerQuery))
    ).slice(0, 10);
  }

  async cacheResponse(query, response) {
    const hash = await this.hashString(query);
    return await this.put('response_cache', {
      query_hash: hash,
      response: response,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }

  async getCachedResponse(query) {
    const hash = await this.hashString(query);
    const all = await this.getAll('response_cache');
    const cached = all.find(c => c.query_hash === hash);
    if (cached && new Date(cached.expires_at) > new Date()) {
      return cached.response;
    }
    return null;
  }

  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async getAnalytics() {
    const chats = await this.getAll('chat_history');
    const tasks = await this.getAll('task_history');
    const learning = await this.getAll('learning_data');
    return {
      totalChats: chats.length,
      totalTasks: tasks.length,
      totalLearned: learning.length,
      topPatterns: learning.sort((a, b) => (b.frequency || 0) - (a.frequency || 0)).slice(0, 5)
    };
  }

  async exportAll() {
    const data = {};
    const stores = ['chat_history', 'learning_data', 'custom_commands', 'qa_knowledge_base'];
    for (const store of stores) {
      data[store] = await this.getAll(store);
    }
    return JSON.stringify(data, null, 2);
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

window.DatabaseManager = DatabaseManager;
console.log('[Database] ✅ IndexedDB Manager Ready - No Node.js Required!');
