/**
 * 🎯 NEXUS AI - Command Parser (বাংলা কমান্ড প্রসেসিং)
 * 
 * এই মডিউল:
 * - বাংলা ভয়েস কমান্ড প্যার্স করে
 * - স্মার্ট ইন্টেন্ট ডিটেকশন করে
 * - কন্টেক্সট-অ্যাওয়ার রেসপন্স প্রদান করে
 * - কাস্টম কমান্ড এক্সিকিউশন পরিচালনা করে
 * - প্যারামিটার এক্সট্রাকশন এবং ভ্যালিডেশন করে
 */

const DatabaseManager = require('./database-manager');

class CommandParser {
  constructor(databaseManager) {
    this.db = databaseManager;
    this.commandRegistry = new Map();
    this.intentPatterns = new Map();
    this.contextStack = [];
    this.currentContext = null;
    this.executionHistory = [];
    this.aliasMap = new Map();
    
    this.initializeBuiltInCommands();
    this.initializeIntentPatterns();
  }

  /**
   * বিল্ট-ইন কমান্ড রেজিস্টার করুন
   */
  initializeBuiltInCommands() {
    // ক্লিক কমান্ড
    this.registerCommand('ক্লিক', {
      aliases: ['click', 'ক্লিক করো'],
      description: 'পাইন্টার অবস্থানে ক্লিক করুন',
      parameters: [
        { name: 'x', type: 'number', optional: true },
        { name: 'y', type: 'number', optional: true }
      ],
      handler: this.handleClick.bind(this)
    });

    // ডাবল ক্লিক কমান্ড
    this.registerCommand('ডাবল ক্লিক', {
      aliases: ['double click', 'দ্বিগুণ ক্লিক'],
      description: 'ডাবল ক্লিক করুন',
      parameters: [
        { name: 'x', type: 'number', optional: true },
        { name: 'y', type: 'number', optional: true }
      ],
      handler: this.handleDoubleClick.bind(this)
    });

    // রাইট ক্লিক কমান্ড
    this.registerCommand('রাইট ক্লিক', {
      aliases: ['right click', 'ডান ক্লিক'],
      description: 'রাইট ক্লিক করুন (কন্টেক্সট মেনু)',
      parameters: [
        { name: 'x', type: 'number', optional: true },
        { name: 'y', type: 'number', optional: true }
      ],
      handler: this.handleRightClick.bind(this)
    });

    // টাইপ কমান্ড
    this.registerCommand('টাইপ', {
      aliases: ['type', 'লিখ', 'লেখো'],
      description: 'টেক্সট টাইপ করুন',
      parameters: [
        { name: 'text', type: 'string', required: true }
      ],
      handler: this.handleType.bind(this)
    });

    // কী প্রেস কমান্ড
    this.registerCommand('কী', {
      aliases: ['key', 'প্রেস'],
      description: 'কীবোর্ড কী প্রেস করুন',
      parameters: [
        { name: 'key', type: 'string', required: true }
      ],
      handler: this.handleKeyPress.bind(this)
    });

    // শর্টকাট কমান্ড
    this.registerCommand('সেভ', {
      aliases: ['save', 'save করো'],
      description: 'Ctrl+S সংরক্ষণ করুন',
      handler: this.handleShortcut.bind(this, 'ctrl+s')
    });

    this.registerCommand('কপি', {
      aliases: ['copy', 'কপি করো'],
      description: 'Ctrl+C কপি করুন',
      handler: this.handleShortcut.bind(this, 'ctrl+c')
    });

    this.registerCommand('পেস্ট', {
      aliases: ['paste', 'পেস্ট করো'],
      description: 'Ctrl+V পেস্ট করুন',
      handler: this.handleShortcut.bind(this, 'ctrl+v')
    });

    this.registerCommand('আন্ডু', {
      aliases: ['undo', 'পূর্বাবস্থায় ফিরিয়ে দাও'],
      description: 'Ctrl+Z আন্ডু করুন',
      handler: this.handleShortcut.bind(this, 'ctrl+z')
    });

    this.registerCommand('রিডু', {
      aliases: ['redo', 'পুনরায় করো'],
      description: 'Ctrl+Y রিডু করুন',
      handler: this.handleShortcut.bind(this, 'ctrl+y')
    });

    // স্ক্রিন এবং উইন্ডো কমান্ড
    this.registerCommand('স্ক্রিনশট', {
      aliases: ['screenshot', 'স্ক্রীন ছবি নাও'],
      description: 'স্ক্রিনশট নিন',
      handler: this.handleScreenshot.bind(this)
    });

    this.registerCommand('সার্চ', {
      aliases: ['search', 'খুঁজ', 'অনুসন্ধান'],
      description: 'কন্টেন্ট সার্চ করুন',
      parameters: [
        { name: 'query', type: 'string', required: true }
      ],
      handler: this.handleSearch.bind(this)
    });

    // ভলিউম এবং সিস্টেম কমান্ড
    this.registerCommand('ভলিউম', {
      aliases: ['volume'],
      description: 'ভলিউম সামঞ্জস্য করুন',
      parameters: [
        { name: 'level', type: 'number', required: true }
      ],
      handler: this.handleVolume.bind(this)
    });

    // ফাইল অপারেশন কমান্ড
    this.registerCommand('খুলো', {
      aliases: ['open', 'ওপেন করো'],
      description: 'ফাইল বা অ্যাপ্লিকেশন খুলুন',
      parameters: [
        { name: 'path', type: 'string', required: true }
      ],
      handler: this.handleOpen.bind(this)
    });

    this.registerCommand('বন্ধ করো', {
      aliases: ['close', 'বন্ধ'],
      description: 'বর্তমান উইন্ডো বন্ধ করুন',
      handler: this.handleClose.bind(this)
    });
  }

  /**
   * ইন্টেন্ট প্যাটার্ন ইনিশিয়ালাইজ করুন
   */
  initializeIntentPatterns() {
    this.intentPatterns.set('automation', {
      keywords: ['ক্লিক', 'টাইপ', 'লিখ', 'ডাবল', 'রাইট', 'খোলো', 'বন্ধ'],
      priority: 10,
      handler: 'automation'
    });

    this.intentPatterns.set('report_generation', {
      keywords: ['রিপোর্ট', 'ডাটা', 'তৈরি', 'জেনারেট', 'তথ্য', 'বিশ্লেষণ'],
      priority: 9,
      handler: 'report'
    });

    this.intentPatterns.set('information_retrieval', {
      keywords: ['কি', 'কিভাবে', 'জানাও', 'বলো', 'কত', 'কোথায', 'খুঁজ'],
      priority: 8,
      handler: 'information'
    });

    this.intentPatterns.set('communication', {
      keywords: ['ইমেইল', 'পাঠাও', 'বার্তা', 'জানাই', 'যোগাযোগ', 'ফোন'],
      priority: 7,
      handler: 'communication'
    });

    this.intentPatterns.set('file_operation', {
      keywords: ['সেভ', 'খোলো', 'মুছুন', 'কপি', 'পেস্ট', 'ফাইল', 'ফোল্ডার'],
      priority: 6,
      handler: 'file'
    });

    this.intentPatterns.set('system_control', {
      keywords: ['শাটডাউন', 'রিস্টার্ট', 'লক', 'স্লিপ', 'ভলিউম', 'উজ্জ্বলতা'],
      priority: 5,
      handler: 'system'
    });

    this.intentPatterns.set('learning_request', {
      keywords: ['শেখাও', 'মনে রাখো', 'এটা শিখ', 'নিয়ম তৈরি', 'সেট করো'],
      priority: 11,
      handler: 'learning'
    });
  }

  /**
   * কমান্ড রেজিস্টার করুন
   */
  registerCommand(name, config) {
    this.commandRegistry.set(name, config);
    
    // এলিয়াস ম্যাপিং
    if (config.aliases) {
      config.aliases.forEach(alias => {
        this.aliasMap.set(alias.toLowerCase(), name);
      });
    }

    // সরাসরি নামও এলিয়াস হিসেবে যোগ করুন
    this.aliasMap.set(name.toLowerCase(), name);
  }

  /**
   * 🔍 কমান্ড প্যার্স করুন এবং এক্সিকিউট করুন
   */
  async parseAndExecute(userInput, userId, context = {}) {
    try {
      console.log(`[CommandParser] Parsing: "${userInput}"`);

      // প্রি-প্রসেসিং
      const processedInput = this.preprocessInput(userInput);
      
      // ইন্টেন্ট ডিটেকশন
      const intent = this.detectIntent(processedInput);
      console.log(`[Intent] ${intent.type} (confidence: ${intent.confidence})`);

      // কমান্ড এক্সট্রাকশন
      const commandInfo = this.extractCommand(processedInput);
      
      if (!commandInfo) {
        // সরাসরি কমান্ড না পেলে এআই এর কাছে পাঠান
        return {
          success: false,
          type: 'ai_query',
          input: userInput,
          intent: intent,
          message: 'কমান্ড স্বীকৃত হয়নি, এআই সহায়তার জন্য প্রেরণ করা হচ্ছে'
        };
      }

      // প্যারামিটার এক্সট্রাকশন
      const parameters = this.extractParameters(processedInput, commandInfo);

      // কমান্ড ভ্যালিডেশন
      const validation = this.validateCommand(commandInfo, parameters);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.message,
          command: commandInfo.name,
          requiredParams: commandInfo.config.parameters
        };
      }

      // কাস্টম কমান্ড চেক করুন
      const customCommand = await this.db.findCommand(userId, commandInfo.name);
      if (customCommand) {
        return await this.executeCustomCommand(customCommand, parameters, userId);
      }

      // বিল্ট-ইন কমান্ড এক্সিকিউট করুন
      const result = await commandInfo.config.handler(parameters, context, userId);

      // এক্সিকিউশন হিস্টরি সংরক্ষণ করুন
      await this.saveExecutionHistory(userId, userInput, commandInfo, result);

      // ডেটাবেসে শিখুন
      await this.db.learnPattern(
        userId,
        'command_pattern',
        commandInfo.name,
        result.response || '',
        { intent: intent.type, success: result.success }
      );

      return {
        success: result.success !== false,
        command: commandInfo.name,
        intent: intent.type,
        result: result,
        parameters: parameters
      };

    } catch (error) {
      console.error('[CommandParser Error]', error);
      return {
        success: false,
        error: error.message,
        input: userInput
      };
    }
  }

  /**
   * ইনপুট প্রি-প্রসেসিং
   */
  preprocessInput(input) {
    // ট্রিম এবং লোয়ারকেস
    let processed = input.trim().toLowerCase();

    // অতিরিক্ত স্পেস সরান
    processed = processed.replace(/\s+/g, ' ');

    // সাধারণ বাংলা ভ্যারিয়েশন স্ট্যান্ডার্ডাইজ করুন
    const replacements = {
      'করো': 'করুন',
      'দাও': 'দিন',
      'হো': 'হন',
      'করলে': 'করুন',
      'খাঁ': 'খান',
    };

    for (const [find, replace] of Object.entries(replacements)) {
      processed = processed.replace(new RegExp(find, 'g'), replace);
    }

    return processed;
  }

  /**
   * ইন্টেন্ট ডিটেকশন
   */
  detectIntent(input) {
    let maxPriority = -1;
    let detectedIntent = { type: 'unknown', confidence: 0 };

    for (const [intentType, pattern] of this.intentPatterns) {
      const matchCount = pattern.keywords.filter(kw => input.includes(kw)).length;
      
      if (matchCount > 0) {
        const confidence = (matchCount / pattern.keywords.length) * (pattern.priority / 11);
        
        if (pattern.priority > maxPriority || confidence > detectedIntent.confidence) {
          maxPriority = pattern.priority;
          detectedIntent = {
            type: intentType,
            confidence: confidence,
            matchedKeywords: pattern.keywords.filter(kw => input.includes(kw))
          };
        }
      }
    }

    return detectedIntent;
  }

  /**
   * কমান্ড এক্সট্রাকশন
   */
  extractCommand(input) {
    // দীর্ঘতম ম্যাচ প্রথমে চেক করুন (greedy matching)
    const sortedAliases = Array.from(this.aliasMap.keys()).sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      if (input.includes(alias)) {
        const commandName = this.aliasMap.get(alias);
        const config = this.commandRegistry.get(commandName);
        
        if (config) {
          return {
            name: commandName,
            alias: alias,
            config: config,
            matchPosition: input.indexOf(alias)
          };
        }
      }
    }

    return null;
  }

  /**
   * প্যারামিটার এক্সট্রাকশন
   */
  extractParameters(input, commandInfo) {
    const parameters = {};
    
    if (!commandInfo.config.parameters) {
      return parameters;
    }

    for (const param of commandInfo.config.parameters) {
      // কমান্ডের পরের অংশ থেকে প্যারামিটার এক্সট্রাক্ট করুন
      const afterCommand = input.substring(commandInfo.matchPosition + commandInfo.alias.length).trim();

      if (param.type === 'number') {
        const numberMatch = afterCommand.match(/(\d+)/);
        if (numberMatch) {
          parameters[param.name] = parseInt(numberMatch[1]);
        }
      } else if (param.type === 'string') {
        // উদ্ধৃতি চেক করুন
        const quotedMatch = afterCommand.match(/"([^"]*)"|'([^']*)'|([\w\s\d]+)/);
        if (quotedMatch) {
          parameters[param.name] = quotedMatch[1] || quotedMatch[2] || quotedMatch[3];
        }
      }
    }

    return parameters;
  }

  /**
   * কমান্ড ভ্যালিডেশন
   */
  validateCommand(commandInfo, parameters) {
    const config = commandInfo.config;
    
    if (!config.parameters) {
      return { valid: true };
    }

    for (const param of config.parameters) {
      if (param.required && !parameters[param.name]) {
        return {
          valid: false,
          message: `প্যারামিটার প্রয়োজন: ${param.name}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * কাস্টম কমান্ড এক্সিকিউট করুন
   */
  async executeCustomCommand(command, parameters, userId) {
    try {
      const actionPayload = JSON.parse(command.action_payload);
      
      // এক্সিকিউশন লজিক (বাস্তবায়ন প্রয়োজন)
      const result = await this.executeAction(
        command.action_type,
        actionPayload,
        parameters
      );

      return {
        success: true,
        commandType: 'custom',
        response: `কমান্ড সম্পন্ন: ${command.command_name}`,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🖱️ ক্লিক হ্যান্ডলার
   */
  async handleClick(params, context) {
    // robotjs বা অন্য মাউস লাইব্রেরি ব্যবহার করুন
    return {
      success: true,
      response: 'ক্লিক সম্পন্ন',
      action: 'click',
      x: params.x || context.mouseX || 0,
      y: params.y || context.mouseY || 0
    };
  }

  /**
   * ডাবল ক্লিক হ্যান্ডলার
   */
  async handleDoubleClick(params, context) {
    return {
      success: true,
      response: 'ডাবল ক্লিক সম্পন্ন',
      action: 'double_click',
      x: params.x || context.mouseX || 0,
      y: params.y || context.mouseY || 0
    };
  }

  /**
   * রাইট ক্লিক হ্যান্ডলার
   */
  async handleRightClick(params, context) {
    return {
      success: true,
      response: 'রাইট ক্লিক সম্পন্ন - কন্টেক্সট মেনু প্রদর্শিত',
      action: 'right_click',
      x: params.x || context.mouseX || 0,
      y: params.y || context.mouseY || 0
    };
  }

  /**
   * টাইপ হ্যান্ডলার
   */
  async handleType(params, context) {
    return {
      success: true,
      response: `"${params.text}" টাইপ করা হয়েছে`,
      action: 'type',
      text: params.text
    };
  }

  /**
   * কী প্রেস হ্যান্ডলার
   */
  async handleKeyPress(params, context) {
    return {
      success: true,
      response: `"${params.key}" কী প্রেস করা হয়েছে`,
      action: 'key_press',
      key: params.key
    };
  }

  /**
   * শর্টকাট হ্যান্ডলার
   */
  async handleShortcut(shortcut, params, context) {
    const shortcutNames = {
      'ctrl+s': 'সংরক্ষণ',
      'ctrl+c': 'কপি',
      'ctrl+v': 'পেস্ট',
      'ctrl+z': 'পূর্বাবস্থায় ফিরিয়ে দেওয়া',
      'ctrl+y': 'পুনরায় করা'
    };

    return {
      success: true,
      response: `${shortcutNames[shortcut] || shortcut} সম্পন্ন`,
      action: 'shortcut',
      shortcut: shortcut
    };
  }

  /**
   * স্ক্রিনশট হ্যান্ডলার
   */
  async handleScreenshot(params, context) {
    return {
      success: true,
      response: 'স্ক্রিনশট নেওয়া হয়েছে',
      action: 'screenshot',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * সার্চ হ্যান্ডলার
   */
  async handleSearch(params, context, userId) {
    // নলেজ বেস থেকে সার্চ কর��ন
    const results = await this.db.searchKnowledgeBase(userId, params.query);
    
    return {
      success: true,
      response: `${results.length} ফলাফল পাওয়া গেছে`,
      action: 'search',
      query: params.query,
      results: results
    };
  }

  /**
   * ভলিউম হ্যান্ডলার
   */
  async handleVolume(params, context) {
    const level = Math.max(0, Math.min(100, params.level));
    return {
      success: true,
      response: `ভলিউম ${level}% এ সেট করা হয়েছে`,
      action: 'volume',
      level: level
    };
  }

  /**
   * খুলো হ্যান্ডলার
   */
  async handleOpen(params, context) {
    return {
      success: true,
      response: `"${params.path}" খোলা হয়েছে`,
      action: 'open',
      path: params.path
    };
  }

  /**
   * বন্ধ করো হ্যান্ডলার
   */
  async handleClose(params, context) {
    return {
      success: true,
      response: 'উইন্ডো বন্ধ করা হয়েছে',
      action: 'close'
    };
  }

  /**
   * এক্সিকিউট করুন (জেনারিক)
   */
  async executeAction(actionType, payload, parameters) {
    switch (actionType) {
      case 'http':
        return await this.executeHttpAction(payload, parameters);
      case 'script':
        return await this.executeScriptAction(payload, parameters);
      case 'system':
        return await this.executeSystemAction(payload, parameters);
      default:
        return { success: false, error: 'অজানা অ্যাকশন টাইপ' };
    }
  }

  async executeHttpAction(payload, parameters) {
    // HTTP রিকোয়েস্ট এক্সিকিউট করুন
    return { success: true, action: 'http' };
  }

  async executeScriptAction(payload, parameters) {
    // স্ক্রিপ্ট এক্সিকিউট করুন
    return { success: true, action: 'script' };
  }

  async executeSystemAction(payload, parameters) {
    // সিস্টেম কমান্ড এক্সিকিউট করুন
    return { success: true, action: 'system' };
  }

  /**
   * এক্সিকিউশন হিস্টরি সংরক্ষণ করুন
   */
  async saveExecutionHistory(userId, input, commandInfo, result) {
    this.executionHistory.push({
      userId,
      input,
      command: commandInfo.name,
      result: result,
      timestamp: new Date(),
      success: result.success !== false
    });

    // ডেটাবেসে সংরক্ষণ করুন
    if (this.db) {
      await this.db.saveTaskExecution(userId, {
        name: commandInfo.name,
        type: 'command_execution',
        status: result.success ? 'success' : 'error',
        inputData: { input },
        outputData: result,
        executionTime: 0,
        errorMessage: result.error || null
      });
    }
  }

  /**
   * পূর্ববর্তী কমান্ড পান
   */
  getPreviousCommand(offset = 1) {
    const index = this.executionHistory.length - offset;
    return index >= 0 ? this.executionHistory[index] : null;
  }

  /**
   * কমান্ড সাজেশন
   */
  async suggestCommands(userId, input) {
    const suggestions = [];
    const processed = this.preprocessInput(input);

    // সরাসরি ম্যাচ
    for (const [alias, name] of this.aliasMap) {
      if (alias.includes(processed) && suggestions.length < 5) {
        suggestions.push({
          command: name,
          alias: alias,
          type: 'direct_match'
        });
      }
    }

    // নলেজ বেস সাজেশন
    if (suggestions.length < 5) {
      const aiSuggestions = await this.db.generateSuggestions(userId, input);
      suggestions.push(...aiSuggestions.commands.map(cmd => ({
        command: cmd.command_name,
        type: 'custom',
        usage: cmd.usage_count
      })));
    }

    return suggestions.slice(0, 5);
  }

  /**
   * কমান্ড রিপ্লেয়
   */
  async replayCommand(index, userId) {
    if (index < 0 || index >= this.executionHistory.length) {
      return { success: false, error: 'অবৈধ ইন্ডেক্স' };
    }

    const command = this.executionHistory[index];
    return await this.parseAndExecute(command.input, userId);
  }

  /**
   * স্ট্যাটিস্টিক্স পান
   */
  getStatistics() {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(h => h.success).length;
    const failed = total - successful;

    const commandUsage = {};
    for (const execution of this.executionHistory) {
      commandUsage[execution.command] = (commandUsage[execution.command] || 0) + 1;
    }

    return {
      totalCommands: total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%',
      commandUsage,
      topCommand: Object.entries(commandUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    };
  }

  /**
   * সব কমান্ড লিস্ট করুন
   */
  listAllCommands() {
    const commands = [];
    
    for (const [name, config] of this.commandRegistry) {
      commands.push({
        name,
        aliases: config.aliases || [],
        description: config.description,
        parameters: config.parameters || []
      });
    }

    return commands;
  }
}

module.exports = CommandParser;
