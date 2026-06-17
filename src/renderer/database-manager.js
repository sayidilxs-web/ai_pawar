/**
 * 🗄️ NEXUS AI - Database Manager (শেখার সিস্টেম সহ)
 * 
 * এই মডিউল:
 * - ব্যবহারকারীর সমস্ত ইন্টারঅ্যাকশন শেখা এবং সংরক্ষণ করে
 * - AI কে স্মার্ট সাজেশন দিতে পারে
 * - বিভিন্ন ক্যাটাগরিতে জ্ঞান জমা রাখে
 * - প্যাটার্ন রিকগনিশন করে
 * - ডেটা অ্যানালিটিক্স প্রদান করে
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(process.env.APPDATA || process.env.HOME, 'NEXUS_AI', 'nexus_ai.db');
    this.db = null;
    this.initialized = false;
    this.learningCache = new Map();
    this.responseTemplates = new Map();
    this.userPatterns = new Map();
    
    // নিশ্চিত করুন ডিরেক্টরি আছে
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * ডাটাবেস ইনিশিয়ালাইজ করুন
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, async (err) => {
        if (err) {
          console.error('DB Error:', err);
          reject(err);
        } else {
          await this.createTables();
          this.initialized = true;
          console.log('✅ Database initialized');
          resolve();
        }
      });
    });
  }

  /**
   * সমস্ত টেবিল তৈরি করুন
   */
  async createTables() {
    const tables = [
      // ইউজার প্রোফাইল এবং প্রেফারেন্স
      `CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY,
        user_id TEXT UNIQUE,
        name TEXT,
        language TEXT DEFAULT 'bn-BD',
        timezone TEXT,
        preferences TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // চ্যাট হিস্টরি এবং কথোপকথন
      `CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        session_id TEXT,
        user_message TEXT,
        ai_response TEXT,
        confidence_score REAL,
        tags TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        helpful BOOLEAN,
        category TEXT
      )`,

      // শেখার ডাটা - প্যাটার্ন, কমান্ড, নিয়ম
      `CREATE TABLE IF NOT EXISTS learning_data (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        pattern_type TEXT,
        pattern_content TEXT,
        response_template TEXT,
        frequency INTEGER DEFAULT 1,
        success_rate REAL DEFAULT 0,
        confidence REAL DEFAULT 0.5,
        tags TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME,
        UNIQUE(user_id, pattern_type, pattern_content)
      )`,

      // কাস্টম কমান্ড এবং শর্টকাট
      `CREATE TABLE IF NOT EXISTS custom_commands (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        command_name TEXT,
        command_trigger TEXT UNIQUE,
        action_type TEXT,
        action_payload TEXT,
        description TEXT,
        category TEXT,
        usage_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // টাস্ক এবং অটোমেশন রুলস
      `CREATE TABLE IF NOT EXISTS automation_rules (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        rule_name TEXT,
        trigger_type TEXT,
        trigger_value TEXT,
        action_type TEXT,
        action_payload TEXT,
        condition_logic TEXT,
        enabled BOOLEAN DEFAULT 1,
        execution_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // ইউজার প্রশ্ন এবং উত্তর QA পেয়ার (নলেজ বেস)
      `CREATE TABLE IF NOT EXISTS qa_knowledge_base (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        category TEXT,
        question TEXT,
        answer TEXT,
        keywords TEXT,
        context TEXT,
        relevance_score REAL,
        usage_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // রিপোর্ট টেমপ্লেট এবং জেনারেটর (Google ভাগবাহন যেমন)
      `CREATE TABLE IF NOT EXISTS report_templates (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        report_name TEXT,
        report_type TEXT,
        template_content TEXT,
        field_mappings TEXT,
        data_sources TEXT,
        automation_schedule TEXT,
        platforms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // ব্যবহারকারীর কাজের ইতিহাস (অডিট লগ)
      `CREATE TABLE IF NOT EXISTS task_history (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        task_name TEXT,
        task_type TEXT,
        status TEXT,
        input_data TEXT,
        output_data TEXT,
        execution_time INTEGER,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // নিউরাল নেটওয়ার্ক ওয়েট এবং মডেল ডেটা
      `CREATE TABLE IF NOT EXISTS ai_model_data (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        model_name TEXT,
        model_type TEXT,
        weights TEXT,
        accuracy REAL,
        training_data TEXT,
        parameters TEXT,
        version TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // বিভিন্ন প্ল্যাটফর্মের ক্রেডেনশিয়াল এবং এপিআই কীস (এনক্রিপ্টেড)
      `CREATE TABLE IF NOT EXISTS api_credentials (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        platform_name TEXT,
        credential_type TEXT,
        encrypted_value TEXT,
        encryption_key_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )`,

      // ফিডব্যাক এবং উন্নতির জন্য ডাটা
      `CREATE TABLE IF NOT EXISTS user_feedback (
        id INTEGER PRIMARY KEY,
        user_id TEXT,
        task_id INTEGER,
        rating INTEGER,
        feedback_text TEXT,
        issue_type TEXT,
        resolution TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // ক্যাশড রেসপন্স এবং টেমপ্লেট
      `CREATE TABLE IF NOT EXISTS response_cache (
        id INTEGER PRIMARY KEY,
        query_hash TEXT UNIQUE,
        response TEXT,
        generation_time INTEGER,
        usage_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )`
    ];

    for (const sql of tables) {
      await this.run(sql);
    }

    // ইন্ডেক্স তৈরি করুন পারফরম্যান্সের জন্য
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_learning_data_user_type ON learning_data(user_id, pattern_type)',
      'CREATE INDEX IF NOT EXISTS idx_custom_commands_user ON custom_commands(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_automation_rules_user ON automation_rules(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_qa_kb_category ON qa_knowledge_base(category)',
      'CREATE INDEX IF NOT EXISTS idx_task_history_user ON task_history(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_response_cache_hash ON response_cache(query_hash)'
    ];

    for (const sql of indices) {
      await this.run(sql);
    }
  }

  /**
   * সাধারণ ডাটাবেস অপারেশন
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * ব্যবহারকারী প্রোফাইল সেটআপ করুন
   */
  async setupUserProfile(userId, userData = {}) {
    const { name = 'User', language = 'bn-BD', timezone = 'Asia/Dhaka' } = userData;
    
    await this.run(
      `INSERT OR REPLACE INTO user_profile (user_id, name, language, timezone, preferences)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, language, timezone, JSON.stringify(userData)]
    );

    return { userId, name, language, timezone };
  }

  /**
   * 🎓 AI কে শেখান - নতুন প্যাটার্ন যোগ করুন
   */
  async learnPattern(userId, patternType, patternContent, responseTemplate, metadata = {}) {
    const result = await this.run(
      `INSERT OR REPLACE INTO learning_data 
       (user_id, pattern_type, pattern_content, response_template, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, patternType, patternContent, responseTemplate, JSON.stringify(metadata)]
    );

    this.learningCache.set(`${patternType}:${patternContent}`, {
      responseTemplate,
      metadata,
      timestamp: new Date()
    });

    return result;
  }

  /**
   * চ্যাট সেভ করুন এবং থেকে শিখুন
   */
  async saveChatMessage(userId, sessionId, userMessage, aiResponse, metadata = {}) {
    const result = await this.run(
      `INSERT INTO chat_history 
       (user_id, session_id, user_message, ai_response, tags, category, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        userId,
        sessionId,
        userMessage,
        aiResponse,
        JSON.stringify(metadata.tags || []),
        metadata.category || 'general'
      ]
    );

    // ব্যবহারকারীর বার্তা থেকে প্যাটার্ন শিখুন
    await this.extractAndLearnPatterns(userId, userMessage, aiResponse);

    return result;
  }

  /**
   * 🧠 স্বয়ংক্রিয় প্যাটার্ন এক্সট্র্যাকশন
   */
  async extractAndLearnPatterns(userId, userMessage, aiResponse) {
    // কীওয়ার্ড এক্সট্র্যাকশন
    const keywords = this.extractKeywords(userMessage);
    
    // প্যাটার্ন টাইপ সনাক্ত করুন
    const patternType = this.classifyMessageType(userMessage);
    
    // শেখান
    for (const keyword of keywords) {
      await this.learnPattern(userId, patternType, keyword, aiResponse, {
        source: 'auto_learning',
        confidence: 0.8
      });
    }
  }

  /**
   * কীওয়ার্ড এক্সট্র্যাক্ট করুন
   */
  extractKeywords(text) {
    // এখানে NLP এবং টোকেনাইজেশন করতে পারেন
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 3);
  }

  /**
   * বার্তা ক্লাসিফাই করুন
   */
  classifyMessageType(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('ক্লিক') || lower.includes('টাইপ')) return 'automation';
    if (lower.includes('রিপোর্ট') || lower.includes('ডেটা')) return 'report_generation';
    if (lower.includes('সেভ') || lower.includes('সংরক্ষণ')) return 'file_operation';
    if (lower.includes('অনুসন্ধান') || lower.includes('খুঁজ')) return 'search';
    if (lower.includes('ইমেইল') || lower.includes('পাঠান')) return 'communication';
    
    return 'general';
  }

  /**
   * কাস্টম কমান্ড রেজিস্টার করুন
   */
  async registerCustomCommand(userId, commandName, trigger, action, description = '') {
    const result = await this.run(
      `INSERT INTO custom_commands 
       (user_id, command_name, command_trigger, action_type, action_payload, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, commandName, trigger, action.type, JSON.stringify(action.payload), description]
    );

    return result;
  }

  /**
   * কমান্ড অনুসন্ধান করুন
   */
  async findCommand(userId, trigger) {
    const command = await this.get(
      `SELECT * FROM custom_commands WHERE user_id = ? AND command_trigger LIKE ?`,
      [userId, `%${trigger}%`]
    );

    if (command) {
      // ব্যবহার কাউন্ট বৃদ্ধি করুন
      await this.run(
        `UPDATE custom_commands SET usage_count = usage_count + 1 WHERE id = ?`,
        [command.id]
      );
    }

    return command;
  }

  /**
   * অটোমেশন রুল তৈরি করুন
   */
  async createAutomationRule(userId, ruleName, trigger, action, conditions = {}) {
    const result = await this.run(
      `INSERT INTO automation_rules 
       (user_id, rule_name, trigger_type, trigger_value, action_type, action_payload, condition_logic)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        ruleName,
        trigger.type,
        trigger.value,
        action.type,
        JSON.stringify(action.payload),
        JSON.stringify(conditions)
      ]
    );

    return result;
  }

  /**
   * 📊 রিপোর্ট টেমপ্লেট সংরক্ষণ করুন
   */
  async saveReportTemplate(userId, reportData) {
    const {
      name,
      type,
      content,
      fieldMappings = {},
      dataSources = [],
      platforms = [],
      schedule = null
    } = reportData;

    const result = await this.run(
      `INSERT INTO report_templates 
       (user_id, report_name, report_type, template_content, field_mappings, data_sources, platforms, automation_schedule)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        type,
        content,
        JSON.stringify(fieldMappings),
        JSON.stringify(dataSources),
        JSON.stringify(platforms),
        schedule
      ]
    );

    return result;
  }

  /**
   * রিপোর্ট টেমপ্লেট লোড করুন
   */
  async getReportTemplate(userId, reportName) {
    const template = await this.get(
      `SELECT * FROM report_templates WHERE user_id = ? AND report_name = ?`,
      [userId, reportName]
    );

    if (template) {
      return {
        ...template,
        fieldMappings: JSON.parse(template.field_mappings),
        dataSources: JSON.parse(template.data_sources),
        platforms: JSON.parse(template.platforms)
      };
    }

    return null;
  }

  /**
   * 🔒 এনক্রিপ্টেড এপিআই ক্রেডেনশিয়াল সেভ করুন
   */
  async saveApiCredential(userId, platformName, credentialType, value, expiresAt = null) {
    const encryptionKey = this.generateEncryptionKey(userId);
    const encrypted = this.encrypt(value, encryptionKey);
    const keyHash = crypto.createHash('sha256').update(encryptionKey).digest('hex');

    await this.run(
      `INSERT INTO api_credentials 
       (user_id, platform_name, credential_type, encrypted_value, encryption_key_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, platformName, credentialType, encrypted, keyHash, expiresAt]
    );
  }

  /**
   * এনক্রিপ্টেড ক্রেডেনশিয়াল রিট্রিভ করুন
   */
  async getApiCredential(userId, platformName) {
    const credential = await this.get(
      `SELECT * FROM api_credentials WHERE user_id = ? AND platform_name = ?`,
      [userId, platformName]
    );

    if (credential) {
      const encryptionKey = this.generateEncryptionKey(userId);
      const decrypted = this.decrypt(credential.encrypted_value, encryptionKey);
      return decrypted;
    }

    return null;
  }

  /**
   * 🔐 এনক্রিপশন ফাংশন
   */
  generateEncryptionKey(userId) {
    return crypto.createHash('sha256').update(userId + process.env.SECRET_KEY).digest('hex');
  }

  encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(text, key) {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * QA নলেজ বেস যোগ করুন
   */
  async addQAToKnowledgeBase(userId, category, question, answer, keywords = []) {
    const result = await this.run(
      `INSERT INTO qa_knowledge_base 
       (user_id, category, question, answer, keywords)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, category, question, answer, JSON.stringify(keywords)]
    );

    return result;
  }

  /**
   * নলেজ বেস থেকে অনুসন্ধান করুন
   */
  async searchKnowledgeBase(userId, query) {
    const results = await this.all(
      `SELECT * FROM qa_knowledge_base 
       WHERE user_id = ? AND (question LIKE ? OR keywords LIKE ?)
       ORDER BY relevance_score DESC LIMIT 10`,
      [userId, `%${query}%`, `%${query}%`]
    );

    // ব্যবহার কাউন্ট বৃদ্ধি করুন
    for (const result of results) {
      await this.run(
        `UPDATE qa_knowledge_base SET usage_count = usage_count + 1 WHERE id = ?`,
        [result.id]
      );
    }

    return results;
  }

  /**
   * কাজের ইতিহাস সংরক্ষণ করুন
   */
  async saveTaskExecution(userId, taskData) {
    const {
      name,
      type,
      status,
      inputData = {},
      outputData = {},
      executionTime = 0,
      errorMessage = null
    } = taskData;

    await this.run(
      `INSERT INTO task_history 
       (user_id, task_name, task_type, status, input_data, output_data, execution_time, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        type,
        status,
        JSON.stringify(inputData),
        JSON.stringify(outputData),
        executionTime,
        errorMessage
      ]
    );
  }

  /**
   * 📈 ইউজার অ্যানালিটিক্স পান
   */
  async getUserAnalytics(userId) {
    const totalChats = await this.get(
      `SELECT COUNT(*) as count FROM chat_history WHERE user_id = ?`,
      [userId]
    );

    const topCategories = await this.all(
      `SELECT category, COUNT(*) as count FROM chat_history WHERE user_id = ?
       GROUP BY category ORDER BY count DESC LIMIT 5`,
      [userId]
    );

    const taskHistory = await this.all(
      `SELECT task_type, status, COUNT(*) as count FROM task_history WHERE user_id = ?
       GROUP BY task_type, status`,
      [userId]
    );

    const learningStats = await this.get(
      `SELECT COUNT(*) as total, AVG(success_rate) as avg_success FROM learning_data WHERE user_id = ?`,
      [userId]
    );

    return {
      totalChats: totalChats.count,
      topCategories,
      taskHistory,
      learningStats
    };
  }

  /**
   * ✨ স্মার্ট সাজেশন জেনারেট করুন
   */
  async generateSuggestions(userId, context = '') {
    // সর্বাধিক ব্যবহৃত কমান্ড
    const topCommands = await this.all(
      `SELECT * FROM custom_commands WHERE user_id = ?
       ORDER BY usage_count DESC LIMIT 5`,
      [userId]
    );

    // সম্পর্কিত QA
    const relatedQA = await this.searchKnowledgeBase(userId, context);

    // প্যাটার্ন-ভিত্তিক সাজেশন
    const patterns = await this.all(
      `SELECT * FROM learning_data WHERE user_id = ? AND pattern_content LIKE ?
       ORDER BY frequency DESC LIMIT 3`,
      [userId, `%${context}%`]
    );

    return {
      commands: topCommands,
      qa: relatedQA,
      patterns
    };
  }

  /**
   * সম্পূর্ণ ডেটা ব্যাকআপ করুন
   */
  async backupDatabase() {
    return new Promise((resolve, reject) => {
      const backupPath = path.join(
        path.dirname(this.dbPath),
        `backup_${new Date().getTime()}.db`
      );

      const readStream = fs.createReadStream(this.dbPath);
      const writeStream = fs.createWriteStream(backupPath);

      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', () => resolve(backupPath));

      readStream.pipe(writeStream);
    });
  }

  /**
   * ডাটাবেস ক্লিনআপ এবং অপটিমাইজেশন
   */
  async optimizeDatabase() {
    await this.run('VACUUM');
    await this.run('ANALYZE');
    console.log('Database optimized');
  }

  /**
   * ডাটাবেস বন্ধ করুন
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = DatabaseManager;
