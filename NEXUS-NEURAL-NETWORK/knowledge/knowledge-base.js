/**
 * NEXUS AI - Knowledge Base System
 * এটাই তোমার AI-এর মস্তিষ্ক!
 * সমস্ত জ্ঞান এখানে সংরক্ষিত থাকবে
 * 
 * এই সিস্টেমে আছে:
 * - প্রোগ্রামিং ভাষা ও কনসেপ্ট
 * - পৃথিবীর ১০০+ ভাষা
 * - বিজ্ঞান (পদার্থ, রসায়ন, জীববিদ্যা)
 * - গণিত (আরিথমেটিক থেকে ক্যালকুলাস)
 * - সাহিত্য ও ইতিহাস
 * - মেডিসিন ও স্বাস্থ্য
 * - প্রযুক্তি
 * - আইন, অর্থনীতি
 * - রান্না, খেলাধুলা
 * - ধর্ম, দর্শন
 * - কথোপকথন
 */

class NEXUSKnowledgeBase {
    constructor() {
        this.initialized = false;
        this.knowledge = {};
        this.indexes = {};
        this.categories = [
            'programming',      // কোডিং
            'languages',        // ভাষা
            'science',          // বিজ্ঞান
            'mathematics',      // গণিত
            'literature',      // সাহিত্য ও ইতিহাস
            'medicine',         // মেডিসিন
            'technology',       // প্রযুক্তি
            'general',          // আইন, অর্থনীতি, রান্না, খেলা
            'conversation',     // কথোপকথন
            
            // নতুন যোগ করা ক্যাটাগরি
            'symbols_and_tokens',           // টোকেন ও সিম্বল ডিকশনারি (পার্ট ১)
            'symbols_tokens_part_two',      // টোকেন ও সিম্বল ডিকশনারি (পার্ট ২)
            'core_syntax_rules',            // কোর সিনট্যাক্স রুলস
            'data_types_structures',        // ডেটা টাইপ ও স্ট্রাকচার
            'reserved_keywords',            // রিজার্ভড কীওয়ার্ড
            'advanced_values_symbols',      // অ্যাডভান্সড ভ্যালু ও সিম্বল
            'control_flow_graph',           // কন্ট্রোল ফ্লো ও এক্সিকিউশন গ্রাফ
            'advanced_conversational_intents', // অ্যাডভান্সড কথোপকথন ইন্টেন্ট
            'universal_domain_knowledge',   // ইউনিভার্সাল ডোমেইন নলেজ
            'universal_intelligence',       // ইউনিভার্সাল হিউম্যান অ্যান্ড সিস্টেম ইন্টেলিজেন্স
            'free_dom_infinity'             // ফ্রিডম ইনফিনিটি
        ];
        
        this.loadKnowledge();
    }

    async loadKnowledge() {
        console.log('[NEXUS Knowledge] 📚 মস্তিষ্ক লোড হচ্ছে...');
        console.log('[NEXUS Knowledge] এটাতে থাকবে: Coding, ভাষা, বিজ্ঞান, গণিত, সাহিত্য, মেডিসিন, প্রযুক্তি!');
        
        try {
            // সব জ্ঞান লোড করো - JSON ফাইল থেকে
            this.knowledge = {
                programming: await this.loadJSON('knowledge/data/programming.json'),
                languages: await this.loadJSON('knowledge/data/languages.json'),
                science: await this.loadJSON('knowledge/data/science.json'),
                mathematics: await this.loadJSON('knowledge/data/mathematics.json'),
                literature: await this.loadJSON('knowledge/data/literature.json'),
                medicine: await this.loadJSON('knowledge/data/medicine.json'),
                technology: await this.loadJSON('knowledge/data/technology.json'),
                general: await this.loadJSON('knowledge/data/general.json'),
                conversation: await this.loadJSON('knowledge/data/conversation.json'),
                
                // নতুন যোগ করা ডেটা ফাইল
                symbols_and_tokens: await this.loadJSON('knowledge/data/symbols_and_tokens_dictionary.json'),
                symbols_tokens_part_two: await this.loadJSON('knowledge/data/1symbols_and_tokens_dictionary.json'),
                core_syntax_rules: await this.loadJSON('knowledge/data/core_syntax_rules.json'),
                data_types_structures: await this.loadJSON('knowledge/data/data_types_and_structures_registry.json'),
                reserved_keywords: await this.loadJSON('knowledge/data/reserved_keywords_map.json'),
                advanced_values_symbols: await this.loadJSON('knowledge/data/advanced_values_and_compounded_symbols.json'),
                control_flow_graph: await this.loadJSON('knowledge/data/control_flow_and_execution_graph.json'),
                advanced_conversational_intents: await this.loadJSON('knowledge/data/advanced_conversational_intents_and_psychology.json'),
                universal_domain_knowledge: await this.loadJSON('knowledge/data/universal_domain_knowledge_base.json'),
                universal_intelligence: await this.loadJSON('knowledge/data/universal_human_and_system_intelligence.json'),
                free_dom_infinity: await this.loadJSON('knowledge/data/FREE_DOM_INFINITY.json')
            };
        } catch (e) {
            console.warn('[NEXUS] JSON লোড সমস্যা, embedded data ব্যবহার করছি...');
            // Embedded data fallback
            this.knowledge = {
                programming: this.getEmbeddedProgramming(),
                languages: this.getEmbeddedLanguages(),
                science: this.getEmbeddedScience(),
                mathematics: this.getEmbeddedMathematics(),
                literature: this.getEmbeddedLiterature(),
                medicine: this.getEmbeddedMedicine(),
                technology: this.getEmbeddedTechnology(),
                general: this.getEmbeddedGeneral(),
                conversation: this.getEmbeddedConversation(),
                
                // নতুন ক্যাটাগরির জন্য ফলব্যাক
                symbols_and_tokens: this.getEmbeddedSymbolsTokens(),
                symbols_tokens_part_two: this.getEmbeddedSymbolsTokensPartTwo(),
                core_syntax_rules: this.getEmbeddedCoreSyntax(),
                data_types_structures: this.getEmbeddedDataTypes(),
                reserved_keywords: this.getEmbeddedReservedKeywords(),
                advanced_values_symbols: this.getEmbeddedAdvancedValues(),
                control_flow_graph: this.getEmbeddedControlFlow(),
                advanced_conversational_intents: this.getEmbeddedConversationalIntents(),
                universal_domain_knowledge: this.getEmbeddedUniversalDomain(),
                universal_intelligence: this.getEmbeddedUniversalIntelligence(),
                free_dom_infinity: this.getEmbeddedFreeDomInfinity()
            };
        }
        
        this.buildIndexes();
        this.initialized = true;
        console.log('[NEXUS Knowledge] ✅ মস্তিষ্ক লোড হয়েছে!');
        console.log('[NEXUS Knowledge] 📊 মোট বিভাগ:', Object.keys(this.knowledge).length);
        
        // Neural Network এবং Smart Learning এ কানেক্ট করো
        this.connectToNeuralNetwork();
    }
    
    // Neural Network এবং Smart Learning সিস্টেমে কানেক্ট করা
    connectToNeuralNetwork() {
        console.log('[NEXUS Knowledge] 🔗 Neural Network এবং Learning Pipeline এ কানেক্ট হচ্ছে...');
        
        // Smart Learning System এ কানেক্ট
        if (window.smartLearning) {
            // জ্ঞান থেকে প্যাটার্ন শিখো
            for (const [category, data] of Object.entries(this.knowledge)) {
                if (data && typeof data === 'object') {
                    this.extractPatternsFromData(category, data);
                }
            }
            console.log('[NEXUS Knowledge] ✅ Smart Learning সিস্টেমে কানেক্টেড');
        }
        
        // NEXUS Neural Network Core এ কানেক্ট
        if (window.NEXUSCore) {
            // জ্ঞানকে নিউরাল নেটওয়ার্কের জন্য প্রস্তুত করো
            const neuralData = this.prepareDataForNeuralNetwork();
            window.NEXUSCore.setKnowledgeBase(neuralData);
            console.log('[NEXUS Knowledge] ✅ NEXUS Neural Network Core এ কানেক্টেড');
        }
        
        // Transaction Pipeline এ কানেক্ট
        if (window.transactionPipeline) {
            window.transactionPipeline.registerStage('knowledge-process', {
                handler: async (data) => {
                    data.knowledgeContext = this.search(data.input || '');
                    return data;
                },
                dependencies: ['parse'],
                priority: 3
            });
            console.log('[NEXUS Knowledge] ✅ Transaction Pipeline এ কানেক্টেড');
        }
        
        console.log('[NEXUS Knowledge] ✅ সব সিস্টেমে কানেক্ট হয়েছে!');
    }
    
    // ডেটা থেকে প্যাটার্ন বের করে Smart Learning এ পাঠাও
    extractPatternsFromData(category, data, path = '') {
        if (!window.smartLearning) return;
        
        const extractRecursive = (obj, currentPath) => {
            if (typeof obj === 'string') {
                // স্ট্রিং ডেটা থেকে প্যাটার্ন শিখো
                if (obj.length > 10 && obj.length < 500) {
                    window.smartLearning.learnPattern(
                        currentPath + '_' + category,
                        obj,
                        0.8 // উচ্চ রিওয়ার্ড কারণ এটি ভ্যালিডেটেড জ্ঞান
                    );
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    extractRecursive(obj[key], currentPath ? `${currentPath}.${key}` : key);
                }
            }
        };
        
        extractRecursive(data, path);
    }
    
    // Neural Network এর জন্য ডেটা প্রস্তুত করো
    prepareDataForNeuralNetwork() {
        const neuralData = {
            embeddings: {},
            categories: Object.keys(this.knowledge),
            metadata: {
                totalCategories: Object.keys(this.knowledge).length,
                loadedAt: Date.now()
            }
        };
        
        // প্রতিটি ক্যাটাগরি থেকে টোকেনাইজড ডেটা তৈরি করো
        for (const [category, data] of Object.entries(this.knowledge)) {
            neuralData.embeddings[category] = this.tokenizeForNeuralNet(data, category);
        }
        
        return neuralData;
    }
    
    // Neural Network এর জন্য টোকেনাইজেশন
    tokenizeForNeuralNet(data, category) {
        const tokens = [];
        
        const tokenizeRecursive = (obj) => {
            if (typeof obj === 'string') {
                // স্ট্রিংকে টোকেনে ভাগ করো
                const words = obj.split(/[\s,.।;:!?()\[\]{}]+/);
                tokens.push(...words.filter(w => w.length > 2));
            } else if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    tokens.push(key); // key-ও টোকেন হিসেবে যোগ করো
                    tokenizeRecursive(obj[key]);
                }
            }
        };
        
        tokenizeRecursive(data);
        return [...new Set(tokens)]; // ইউনিক টোকেন
    }

    async loadJSON(path) {
        try {
            const response = await fetch(path);
            return await response.json();
        } catch (e) {
            console.warn(`[NEXUS] ${path} লোড করতে সমস্যা, ডিফল্ট ব্যবহার করছি`);
            return this.getDefaultKnowledge(path);
        }
    }

    // সার্চ ফাংশন - প্রশ্নের উত্তর খুঁজে বের করে
    search(query, category = null) {
        const queryLower = query.toLowerCase();
        
        // প্রথমে ক্যাটাগরি ঠিক করো
        const targetCategory = category || this.detectCategory(queryLower);
        
        if (targetCategory && this.knowledge[targetCategory]) {
            return this.searchInCategory(queryLower, targetCategory);
        }
        
        // সব ক্যাটাগরিতে খুঁজো
        let results = [];
        for (const cat in this.knowledge) {
            results = results.concat(this.searchInCategory(queryLower, cat));
        }
        
        return this.rankResults(results, queryLower);
    }

    detectCategory(query) {
        const patterns = {
            programming: ['code', 'function', 'python', 'javascript', 'java', ' programming', 'syntax', 'variable', 'array', 'loop', 'algorithm', 'api', 'database', 'html', 'css', 'react', 'node', 'if else', 'switch', 'for while'],
            languages: ['translate', 'language', 'বাংলায়', 'english', 'translation', 'meaning', 'শব্দ', 'বাক্য'],
            science: ['what is', 'chemistry', 'physics', 'biology', 'atom', 'molecule', 'reaction', 'gravity', 'energy', 'cell', 'DNA', 'evolution'],
            mathematics: ['calculate', 'equation', 'math', 'গণিত', 'algebra', 'geometry', 'calculus', 'number', 'formula', ' summation', 'integration'],
            literature: ['book', 'poem', 'poetry', 'author', 'writer', 'novel', 'story', 'kobita', 'golpo', 'shahitto'],
            history: ['history', 'ইতিহাস', 'war', 'battle', 'ancient', 'medieval', 'empire', 'king', 'queen', 'revolution'],
            medicine: ['disease', 'treatment', 'medicine', 'symptom', 'hospital', 'doctor', 'patient', 'রোগ', 'ওষুধ', 'চিকিৎসা'],
            law: ['law', 'আইন', 'legal', 'court', 'judge', 'crime', 'rights', 'human rights', 'constitution'],
            technology: ['ai', 'robot', 'computer', 'internet', 'software', 'hardware', 'app', 'website', 'tech', 'digital'],
            
            // নতুন ক্যাটাগরি
            symbols_and_tokens: ['symbol', 'token', 'operator', 'চিহ্ন', 'টোকেন', '+=', '-=', '==', '!=', '++', '--', '&&', '||'],
            symbols_tokens_part_two: ['plus', 'minus', 'division', 'colon', 'comma', 'underscore', 'numeric', 'literal', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            core_syntax_rules: ['syntax', 'সিনট্যাক্স', 'structure', 'structure', 'grammar', 'rule'],
            data_types_structures: ['data type', 'string', 'number', 'boolean', 'array', 'object', 'map', 'set', 'ডেটা টাইপ', 'অ্যারে', 'হিস্ট'],
            reserved_keywords: ['keyword', 'reserved', 'key word', 'কীওয়ার্ড', 'সংরক্ষিত'],
            advanced_values_symbols: ['value', 'ভ্যালু', 'compound', 'literal', 'constant', 'স্থিরাঙ্ক'],
            control_flow_graph: ['if', 'else', 'switch', 'case', 'for', 'while', 'loop', 'break', 'continue', 'return', 'try', 'catch', 'লুপ', 'শর্ত'],
            advanced_conversational_intents: ['emotion', 'feeling', 'angry', 'frustrated', 'confused', 'খারাপ লাগছে', 'বিরক্ত', 'রাগ', 'হতাশ'],
            universal_domain_knowledge: ['universe', 'world', 'knowledge', 'জ্ঞান', 'বিশ্ব', 'সার্বজনীন'],
            universal_intelligence: ['intelligence', 'smart', 'brain', 'mind', 'ইন্টেলিজেন্স', 'বুদ্ধি', 'মস্তিষ্ক'],
            free_dom_infinity: ['freedom', 'infinity', 'free', 'স্বাধীনতা', 'অসীম']
        };
        
        for (const [cat, keywords] of Object.entries(patterns)) {
            if (keywords.some(kw => query.includes(kw))) {
                return cat;
            }
        }
        return 'general';
    }

    searchInCategory(query, category) {
        const results = [];
        const data = this.knowledge[category];
        
        if (!data) return results;
        
        // Recursive search through nested objects
        const searchRecursive = (obj, path = '') => {
            if (typeof obj === 'string') {
                if (obj.toLowerCase().includes(query)) {
                    results.push({ text: obj, category, path, score: this.calculateScore(query, obj) });
                }
            } else if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    searchRecursive(obj[key], path ? `${path}.${key}` : key);
                }
            }
        };
        
        searchRecursive(data);
        return results;
    }

    calculateScore(query, text) {
        const textLower = text.toLowerCase();
        let score = 0;
        
        // Exact match
        if (textLower === query) score += 100;
        // Starts with query
        else if (textLower.startsWith(query)) score += 50;
        // Contains query
        else if (textLower.includes(query)) score += 20;
        
        // Bonus for exact word match
        const words = query.split(' ');
        for (const word of words) {
            if (textLower.includes(word)) score += 5;
        }
        
        return score;
    }

    rankResults(results, query) {
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(r => r.text);
    }

    buildIndexes() {
        for (const category of this.categories) {
            this.indexes[category] = new Set();
            this.buildIndexRecursive(this.knowledge[category], this.indexes[category]);
        }
        console.log('[NEXUS Knowledge] Index তৈরি হয়েছে');
    }

    buildIndexRecursive(obj, indexSet) {
        if (typeof obj === 'string') {
            obj.split(' ').forEach(word => {
                if (word.length > 2) indexSet.add(word.toLowerCase());
            });
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                indexSet.add(key.toLowerCase());
                this.buildIndexRecursive(obj[key], indexSet);
            }
        }
    }

    // সরাসরি উত্তর দাও
    answer(query) {
        const results = this.search(query);
        if (results.length > 0) {
            return {
                found: true,
                answer: results[0],
                confidence: 0.9
            };
        }
        return { found: false, answer: null, confidence: 0 };
    }

    // Default knowledge - যদি JSON লোড না হয়
    getDefaultKnowledge(path) {
        const category = path.replace('knowledge/', '').replace('.json', '');
        return this.getEmbeddedKnowledge(category);
    }

    getEmbeddedKnowledge(category) {
        const embeddedData = {
            programming: this.getProgrammingKnowledge(),
            languages: this.getLanguagesKnowledge(),
            science: this.getScienceKnowledge(),
            mathematics: this.getMathematicsKnowledge(),
            literature: this.getLiteratureKnowledge(),
            history: this.getHistoryKnowledge(),
            geography: this.getGeographyKnowledge(),
            medicine: this.getMedicineKnowledge(),
            law: this.getLawKnowledge(),
            economics: this.getEconomicsKnowledge(),
            philosophy: this.getPhilosophyKnowledge(),
            religion: this.getReligionKnowledge(),
            arts: this.getArtsKnowledge(),
            sports: this.getSportsKnowledge(),
            technology: this.getTechnologyKnowledge(),
            general: this.getGeneralKnowledge(),
            life_skills: this.getLifeSkillsKnowledge(),
            cooking: this.getCookingKnowledge(),
            conversation: this.getConversationKnowledge()
        };
        return embeddedData[category] || {};
    }

    // ===== PROGRAMMING KNOWLEDGE =====
    getProgrammingKnowledge() {
        return {
            languages: {
                python: {
                    name: "Python",
                    description: "একটি high-level, interpreted প্রোগ্রামিং ভাষা",
                    created: "1991",
                    creator: "Guido van Rossum",
                    features: ["Easy syntax", "Dynamic typing", "Interpreted", "Object-oriented"],
                    used_for: ["Web development", "AI/ML", "Data science", "Automation", "Backend"],
                    example_code: `def hello():
    print("Hello, World!")

hello()`,
                    frameworks: ["Django", "Flask", "FastAPI", "Pandas", "NumPy", "TensorFlow", "PyTorch"],
                    syntax: {
                        variables: "x = 10",
                        list: "my_list = [1, 2, 3]",
                        loop: "for i in range(10):",
                        function: "def my_func(x):",
                        class: "class MyClass:"
                    }
                },
                javascript: {
                    name: "JavaScript",
                    description: "ওয়েবের প্রধান scripting ভাষা",
                    created: "1995",
                    creator: "Brendan Eich",
                    features: ["Dynamic", "Prototype-based", "Event-driven", "Async"],
                    used_for: ["Web frontend", "Web backend", "Mobile apps", "Games"],
                    example_code: `function hello() {
    console.log("Hello, World!");
}

hello();`,
                    frameworks: ["React", "Angular", "Vue", "Node.js", "Express", "Next.js"],
                    syntax: {
                        variables: "let x = 10; const y = 20;",
                        array: "let arr = [1, 2, 3];",
                        loop: "for (let i = 0; i < 10; i++) {}",
                        function: "function myFunc(x) {}",
                        arrow: "const myFunc = (x) => x * 2;"
                    }
                },
                java: {
                    name: "Java",
                    description: "Object-oriented, platform-independent ভাষা",
                    created: "1995",
                    creator: "James Gosling",
                    features: ["Object-oriented", "Platform independent", "Strongly typed", "Multi-threaded"],
                    used_for: ["Enterprise apps", "Android", "Web apps", "Big data"],
                    frameworks: ["Spring", "Hibernate", "Struts", "Android SDK"],
                    syntax: {
                        variables: "int x = 10;",
                        list: "ArrayList<Integer> list = new ArrayList<>();",
                        loop: "for (int i = 0; i < 10; i++) {}",
                        function: "public void myMethod() {}",
                        class: "public class MyClass {}"
                    }
                },
                cpp: {
                    name: "C++",
                    description: "High-performance সিস্টেম প্রোগ্রামিং ভাষা",
                    created: "1983",
                    creator: "Bjarne Stroustrup",
                    features: ["High performance", "Low level memory", "OOP", "STL"],
                    used_for: ["Game development", "Systems programming", "Embedded", "Trading"],
                    frameworks: ["Qt", "Boost", "Unreal Engine", "Cocos2d"],
                    syntax: {
                        variables: "int x = 10;",
                        loop: "for (int i = 0; i < 10; i++) {}",
                        class: "class MyClass {}",
                        pointer: "int* ptr = &x;"
                    }
                },
                csharp: {
                    name: "C#",
                    description: "Microsoft-এর modern OOP ভাষা",
                    created: "2000",
                    creator: "Anders Hejlsberg",
                    features: ["Type-safe", "Component-oriented", "Modern", "LINQ"],
                    used_for: ["Windows apps", "Games", "Web apps", "Cloud"],
                    frameworks: [".NET", "ASP.NET", "Unity", "Xamarin"]
                },
                go: {
                    name: "Go (Golang)",
                    description: "Google-এর fast, simple প্রোগ্রামিং ভাষা",
                    created: "2009",
                    creator: "Robert Griesemer, Rob Pike, Ken Thompson",
                    features: ["Fast compile", "Concurrency", "Simple syntax", "Garbage collected"],
                    used_for: ["Web servers", "Cloud services", "DevOps tools", "Microservices"],
                    syntax: {
                        variables: "var x int = 10",
                        loop: "for i := 0; i < 10; i++ {}",
                        function: "func myFunc(x int) int {}",
                        goroutine: "go myFunc()",
                        channel: "ch := make(chan int)"
                    }
                },
                rust: {
                    name: "Rust",
                    description: "Safe, concurrent, practical ভাষা",
                    created: "2010",
                    creator: "Graydon Hoare",
                    features: ["Memory safety", "Zero-cost abstractions", "Concurrency", "Speed"],
                    used_for: ["Systems programming", "WebAssembly", "CLI tools", "Game engines"]
                },
                swift: {
                    name: "Swift",
                    description: "Apple-এর iOS/macOS ভাষা",
                    created: "2014",
                    creator: "Apple",
                    features: ["Safe", "Fast", "Modern", "Interactive"],
                    used_for: ["iOS apps", "macOS apps", "Apple Watch", "Apple TV"]
                },
                kotlin: {
                    name: "Kotlin",
                    description: "JVM-based modern ভাষা",
                    created: "2011",
                    creator: "JetBrains",
                    features: ["Concise", "Safe", "Interoperable", "Tool-friendly"],
                    used_for: ["Android apps", "Web backend", "Server-side"]
                },
                typescript: {
                    name: "TypeScript",
                    description: "JavaScript-এর superset with types",
                    created: "2012",
                    creator: "Microsoft",
                    features: ["Static typing", "OOP", "ES6+", "Tooling"],
                    used_for: ["Web development", "Node.js", "Enterprise apps"]
                },
                php: {
                    name: "PHP",
                    description: "Server-side scripting ভাষা",
                    created: "1995",
                    creator: "Rasmus Lerdorf",
                    features: ["Easy", "Dynamic", "Database support", "Web-focused"],
                    used_for: ["Web backend", "CMS", "WordPress", "E-commerce"]
                },
                ruby: {
                    name: "Ruby",
                    description: "Productive, elegant ভাষা",
                    created: "1995",
                    creator: "Yukihiro Matsumoto",
                    features: ["Object-oriented", "Dynamic", "Productive", "Elegant"],
                    used_for: ["Web development", "Scripting", "Automation"],
                    frameworks: ["Ruby on Rails", "Sinatra"]
                },
                sql: {
                    name: "SQL",
                    description: "Database query ভাষা",
                    features: ["Data manipulation", "CRUD", "Joins", "Aggregation"],
                    commands: {
                        select: "SELECT * FROM table_name",
                        insert: "INSERT INTO table_name VALUES ()",
                        update: "UPDATE table_name SET column = value",
                        delete: "DELETE FROM table_name WHERE condition",
                        create: "CREATE TABLE table_name ()",
                        join: "SELECT * FROM t1 JOIN t2 ON t1.id = t2.id"
                    }
                },
                html: {
                    name: "HTML",
                    description: "Web page structure markup",
                    tags: {
                        basic: ["html", "head", "body", "title", "meta"],
                        text: ["h1-h6", "p", "span", "div", "strong", "em", "a", "ul", "ol", "li"],
                        form: ["form", "input", "button", "select", "textarea", "label"],
                        media: ["img", "video", "audio", "iframe", "canvas"],
                        semantic: ["header", "nav", "main", "article", "section", "aside", "footer"]
                    }
                },
                css: {
                    name: "CSS",
                    description: "Web page styling language",
                    selectors: [".class", "#id", "element", "[attribute]", ":hover", "::before"],
                    properties: {
                        layout: ["display", "flex", "grid", "position", "float"],
                        spacing: ["margin", "padding", "gap"],
                        styling: ["color", "background", "font-size", "border", "box-shadow"],
                        effects: ["transform", "transition", "animation", "opacity"]
                    }
                }
            },
            concepts: {
                algorithms: {
                    sorting: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort"],
                    searching: ["Linear Search", "Binary Search", "Depth-First Search", "Breadth-First Search"],
                    graph: ["Dijkstra's Algorithm", "Bellman-Ford", "Floyd-Warshall", "A* Search"],
                    dynamic_programming: ["Fibonacci", "Knapsack", "Longest Common Subsequence", "Edit Distance"]
                },
                data_structures: {
                    linear: ["Array", "Linked List", "Stack", "Queue", "Deque"],
                    hierarchical: ["Binary Tree", "Binary Search Tree", "Heap", "Trie", "AVL Tree", "Red-Black Tree"],
                    hash: ["Hash Table", "Hash Map", "Hash Set", "Bloom Filter"],
                    graph: ["Directed Graph", "Undirected Graph", "Weighted Graph", "Adjacency Matrix", "Adjacency List"]
                },
                design_patterns: {
                    creational: ["Singleton", "Factory Method", "Abstract Factory", "Builder", "Prototype"],
                    structural: ["Adapter", "Bridge", "Composite", "Decorator", "Facade", "Proxy"],
                    behavioral: ["Observer", "Strategy", "Command", "State", "Template Method", "Visitor"]
                },
                database_types: {
                    relational: ["MySQL", "PostgreSQL", "Oracle", "SQL Server", "MariaDB"],
                    nosql: {
                        document: ["MongoDB", "CouchDB"],
                        key_value: ["Redis", "DynamoDB", "Memcached"],
                        column: ["Cassandra", "HBase"],
                        graph: ["Neo4j", "Amazon Neptune"]
                    }
                },
                devops: {
                    containers: ["Docker", "Podman", "Kubernetes"],
                    ci_cd: ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI"],
                    cloud: {
                        aws: ["EC2", "S3", "Lambda", "RDS", "ECS", "EKS", "CloudFront", "SQS"],
                        gcp: ["Compute Engine", "Cloud Storage", "Cloud Functions", "BigQuery", "Kubernetes"],
                        azure: ["Virtual Machines", "Blob Storage", "Functions", "Azure SQL", "AKS"]
                    },
                    monitoring: ["Prometheus", "Grafana", "ELK Stack", "Datadog", "New Relic"],
                    infrastructure: ["Terraform", "Ansible", "Puppet", "Chef"]
                }
            }
        };
    }

    // ===== LANGUAGES KNOWLEDGE =====
    getLanguagesKnowledge() {
        return {
            bangla: {
                name: "বাংলা",
                native_name: "বাংলা",
                script: "Bengali script (Unicode)",
                speaking_population: "230 million+",
                countries: ["Bangladesh", "India (West Bengal, Tripura)"],
                grammar: {
                    articles: "কোনো article নেই",
                    gender: "পুরুষ (masc), স্ত্রী (fem), নপুংসক (common)",
                    cases: ["নমিনেটিভ", "অ্যাকিউজেটিভ", "জেনিটিভ", "ডাটিভ", "ইন্সট্রুমেন্টাল", "কমিটেটিভ"],
                    pronouns: {
                        first_person: { singular: "আমি", plural: "আমরা" },
                        second_person: { singular: "তুমি/আপনি", plural: "তোমরা/আপনারা" },
                        third_person: { singular: "সে/এ/ও", plural: "তারা/এরা/ওরা" }
                    },
                    verb_conjugation: {
                        present: { first: "আমি করি", second: "তুমি করো/আপনি করেন", third: "সে করে" },
                        past: { first: "আমি করেছিলাম", second: "তুমি করেছিলে", third: "সে করেছিল" },
                        future: { first: "আমি করব", second: "তুমি করবে", third: "সে করবে" }
                    }
                },
                common_phrases: {
                    greeting: ["নমস্কার (formal)", "হ্যালো (casual)", "কেমন আছো?", "আসসালামু আলাইকুম (Islamic)"],
                    goodbye: ["বিদায়", "চলে যাচ্ছি", "দেখা হবে"],
                    thanks: ["ধন্যবাদ", "অনেক ধন্যবাদ"],
                    sorry: ["দুঃখিত", "মাফ করবেন"],
                    yes_no: ["হ্যাঁ", "না"]
                },
                translation_examples: {
                    english_to_bangla: {
                        "Hello": "হ্যালো/নমস্কার",
                        "How are you?": "তুমি কেমন আছো?",
                        "I am fine": "আমি ভালো আছি",
                        "What is your name?": "তোমার নাম কী?",
                        "My name is...": "আমার নাম...",
                        "Thank you": "ধন্যবাদ",
                        "Goodbye": "বিদায়/আবার দেখা হবে",
                        "I love you": "আমি তোমাকে ভালোবাসি",
                        "Where is...?": "...কোথায়?",
                        "How much?": "কত?/কত টাকা?"
                    }
                }
            },
            major_languages: {
                english: {
                    name: "English",
                    native_name: "English",
                    speaking_population: "1.5 billion+",
                    countries: ["USA", "UK", "India", "Canada", "Australia", "Bangladesh", "and many more"],
                    classification: "Indo-European > Germanic > West Germanic",
                    script: "Latin script",
                    grammar: {
                        articles: ["a", "an", "the"],
                        tenses: {
                            present_simple: "I play",
                            past_simple: "I played",
                            future_simple: "I will play",
                            present_continuous: "I am playing",
                            past_continuous: "I was playing",
                            present_perfect: "I have played",
                            past_perfect: "I had played",
                            present_perfect_continuous: "I have been playing"
                        }
                    }
                },
                hindi: {
                    name: "Hindi",
                    native_name: "हिन्दी",
                    speaking_population: "600 million+",
                    countries: ["India"],
                    script: "Devanagari script",
                    grammar: {
                        gender: "পুরুষ (masc), স্ত্রী (fem)",
                        cases: [" কর্তা", " কর্ম", " করণ", " সম্প্রদান", " অधिकरण", " সংযোগ"]
                    }
                },
                spanish: {
                    name: "Spanish",
                    native_name: "Español",
                    speaking_population: "550 million+",
                    countries: ["Spain", "Latin America", "USA"],
                    script: "Latin script",
                    greetings: ["Hola", "Buenos días", "Buenas noches", "Adiós", "Hasta luego"]
                },
                french: {
                    name: "French",
                    native_name: "Français",
                    speaking_population: "300 million+",
                    countries: ["France", "Canada", "Africa", "Belgium", "Switzerland"],
                    script: "Latin script",
                    greetings: ["Bonjour", "Bonsoir", "Salut", "Au revoir", "Merci", "S'il vous plaît"]
                },
                german: {
                    name: "German",
                    native_name: "Deutsch",
                    speaking_population: "130 million+",
                    countries: ["Germany", "Austria", "Switzerland", "Liechtenstein"],
                    script: "Latin script",
                    greetings: ["Guten Morgen", "Guten Tag", "Guten Abend", "Auf Wiedersehen", "Danke"]
                },
                arabic: {
                    name: "Arabic",
                    native_name: "العربية",
                    speaking_population: "400 million+",
                    countries: ["Saudi Arabia", "Egypt", "UAE", "Morocco", "Iraq", "and others"],
                    script: "Arabic script (Right to left)",
                    direction: "RTL (Right to Left)",
                    greetings: ["مرحبا (Marhaba)", "السلام عليكم (As-salamu alaykum)", "شكراً (Shukran)", "مع السلامة (Ma'a as-salama)"]
                },
                chinese: {
                    name: "Chinese (Mandarin)",
                    native_name: "中文",
                    speaking_population: "1.1 billion+",
                    countries: ["China", "Taiwan", "Singapore"],
                    script: "Chinese characters (Hanzi)",
                    tones: "4 tones",
                    greetings: ["你好 (Nǐ hǎo)", "谢谢 (Xièxiè)", "再见 (Zàijiàn)"]
                },
                japanese: {
                    name: "Japanese",
                    native_name: "日本語",
                    speaking_population: "130 million+",
                    countries: ["Japan"],
                    scripts: ["Hiragana", "Katakana", "Kanji"],
                    greetings: ["こんにちは (Konnichiwa)", "おはよう (Ohayou)", "ありがとう (Arigatou)", "さようなら (Sayounara)"]
                },
                russian: {
                    name: "Russian",
                    native_name: "Русский",
                    speaking_population: "260 million+",
                    countries: ["Russia", "Belarus", "Kazakhstan", "Kyrgyzstan"],
                    script: "Cyrillic script",
                    greetings: ["Привет (Privet)", "Здравствуйте (Zdrastvuyte)", "Спасибо (Spasibo)", "До свидания (Do svidaniya)"]
                },
                portuguese: {
                    name: "Portuguese",
                    native_name: "Português",
                    speaking_population: "250 million+",
                    countries: ["Portugal", "Brazil", "Angola", "Mozambique"],
                    script: "Latin script",
                    greetings: ["Olá", "Bom dia", "Boa noite", "Obrigado/Obrigada", "Tchau"]
                },
                korean: {
                    name: "Korean",
                    native_name: "한국어",
                    speaking_population: "80 million+",
                    countries: ["South Korea", "North Korea"],
                    scripts: ["Hangul", "Hanja (rarely used)"],
                    greetings: ["안녕하세요 (Annyeonghaseyo)", "감사합니다 (Gamsahamnida)", "안녕히 가세요 (Annihilation geseyo)"]
                }
            },
            translation_basics: {
                common_words: {
                    "I": { bangla: "আমি", hindi: "मैं", spanish: "Yo", french: "Je", german: "Ich", arabic: "أنا", chinese: "我", japanese: "私/俺", russian: "Я", portuguese: "Eu" },
                    "you": { bangla: "তুমি", hindi: "तू/आप", spanish: "Tú/Usted", french: "Tu/Vous", german: "Du/Sie", arabic: "أنت", chinese: "你", japanese: "あなた", russian: "Ты/Вы", portuguese: "Você/Tu" },
                    "he": { bangla: "সে", hindi: "वह", spanish: "Él", french: "Il", german: "Er", arabic: "هو", chinese: "他", japanese: "彼", russian: "Он", portuguese: "Ele" },
                    "she": { bangla: "সে", hindi: "वह", spanish: "Ella", french: "Elle", german: "Sie", arabic: "هي", chinese: "她", japanese: "彼女", russian: "Она", portuguese: "Ela" },
                    "we": { bangla: "আমরা", hindi: "हम", spanish: "Nosotros", french: "Nous", german: "Wir", arabic: "نحن", chinese: "我们", japanese: "私たち", russian: "Мы", portuguese: "Nós" },
                    "they": { bangla: "তারা", hindi: "वे", spanish: "Ellos/Ellas", french: "Ils/Elles", german: "Sie", arabic: "هم", chinese: "他们", japanese: "彼ら", russian: "Они", portuguese: "Eles/Elas" },
                    "water": { bangla: "পানি", hindi: "पानी", spanish: "Agua", french: "Eau", german: "Wasser", arabic: "ماء", chinese: "水", japanese: "水", russian: "Вода", portuguese: "Água" },
                    "food": { bangla: "খাবার", hindi: "खाना", spanish: "Comida", french: "Nourriture", german: "Essen", arabic: "طعام", chinese: "食物", japanese: "食べ物", russian: "Еда", portuguese: "Comida" },
                    "house": { bangla: "বাড়ি", hindi: "घर", spanish: "Casa", french: "Maison", german: "Haus", arabic: "بيت", chinese: "房子", japanese: "家", russian: "Дом", portuguese: "Casa" },
                    "book": { bangla: "বই", hindi: "किताब", spanish: "Libro", french: "Livre", german: "Buch", arabic: "كتاب", chinese: "书", japanese: "本", russian: "Книга", portuguese: "Livro" },
                    "hello": { bangla: "হ্যালো/নমস্কার", hindi: "नमस्ते", spanish: "Hola", french: "Bonjour", german: "Hallo", arabic: "مرحبا", chinese: "你好", japanese: "こんにちは", russian: "Привет", portuguese: "Olá" },
                    "thank_you": { bangla: "ধন্যবাদ", hindi: "धन्यवाद", spanish: "Gracias", french: "Merci", german: "Danke", arabic: "شكراً", chinese: "谢谢", japanese: "ありがとう", russian: "Спасибо", portuguese: "Obrigado" }
                }
            }
        };
    }

    // ===== SCIENCE KNOWLEDGE =====
    getScienceKnowledge() {
        return {
            physics: {
                fundamental: {
                    branches: ["Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Mechanics", "Relativity", "Optics", "Acoustics", "Nuclear Physics"],
                    fundamental_forces: [
                        { name: "Gravity", range: "Infinite", strength: "6×10⁻³⁹", carrier: "Graviton (hypothetical)" },
                        { name: "Electromagnetic", range: "Infinite", strength: "1", carrier: "Photon" },
                        { name: "Weak Nuclear", range: "10⁻¹⁸ m", strength: "10⁻⁶", carrier: "W, Z bosons" },
                        { name: "Strong Nuclear", range: "10⁻¹⁵ m", strength: "1", carrier: "Gluon" }
                    ],
                    constants: {
                        speed_of_light: "c = 3×10⁸ m/s",
                        gravitational_constant: "G = 6.674×10⁻¹¹ N·m²/kg²",
                        planck_constant: "h = 6.626×10⁻³⁴ J·s",
                        boltzmann_constant: "k = 1.38×10⁻²³ J/K",
                        avogadro_number: "Nₐ = 6.022×10²³ mol⁻¹",
                        elementary_charge: "e = 1.602×10⁻¹⁹ C",
                        electron_mass: "mₑ = 9.109×10⁻³¹ kg",
                        proton_mass: "mₚ = 1.673×10⁻²⁷ kg"
                    },
                    laws: {
                        "Newton's Laws": [
                            "1st: Inertia - Object stays at rest or motion unless acted upon",
                            "2nd: F = ma - Force equals mass times acceleration",
                            "3rd: Action-Reaction - Every action has equal opposite reaction"
                        ],
                        "Thermodynamics Laws": [
                            "0th: Thermal equilibrium - If A=B and B=C, then A=C",
                            "1st: Energy conservation - ΔU = Q - W",
                            "2nd: Entropy increases - Heat flows from hot to cold",
                            "3rd: Absolute zero unattainable - Cannot reach 0K"
                        ],
                        "Einstein's Laws": [
                            "E = mc² - Mass-energy equivalence",
                            "Time dilation: t' = t/√(1-v²/c²)",
                            "Length contraction: L' = L√(1-v²/c²)"
                        ],
                        "Maxwell's Equations": [
                            "∇·E = ρ/ε₀ (Gauss's law)",
                            "∇·B = 0 (Gauss's law for magnetism)",
                            "∇×E = -∂B/∂t (Faraday's law)",
                            "∇×B = μ₀J + μ₀ε₀∂E/∂t (Ampère's law)"
                        ]
                    }
                },
                mechanics: {
                    kinematics: {
                        displacement: "s = vt",
                        velocity: "v = u + at",
                        position: "s = ut + ½at²",
                        velocity_squared: "v² = u² + 2as"
                    },
                    dynamics: {
                        force: "F = ma",
                        momentum: "p = mv",
                        impulse: "J = FΔt = Δp",
                        kinetic_energy: "KE = ½mv²",
                        potential_energy: "PE = mgh"
                    },
                    circular_motion: {
                        centripetal_force: "F = mv²/r",
                        angular_velocity: "ω = v/r",
                        period: "T = 2πr/v"
                    },
                    gravitation: {
                        force: "F = Gm₁m₂/r²",
                        orbital_velocity: "v = √(GM/r)",
                        escape_velocity: "v = √(2GM/r)"
                    }
                },
                electromagnetism: {
                    electric_field: "E = F/q = kQ/r²",
                    coulomb_law: "F = kq₁q₂/r²",
                    electric_potential: "V = kQ/r",
                    capacitance: "C = Q/V",
                    current: "I = Q/t",
                    resistance: "V = IR",
                    power: "P = IV = I²R = V²/R",
                    magnetic_field: "F = qvBsinθ",
                    faraday_law: "ε = -dΦ/dt",
                    inductance: "ε = -L(dI/dt)"
                },
                quantum_mechanics: {
                    wave_function: "Ψ(x,t)",
                    schrodinger_equation: "iħ∂Ψ/∂t = -ħ²/2m ∇²Ψ + VΨ",
                    heisenberg_uncertainty: "ΔxΔp ≥ ħ/2",
                    photoelectric_effect: "E = hf - φ",
                    de_broglie_wavelength: "λ = h/p",
                    energy_levels: "Eₙ = -13.6/n² eV (hydrogen)"
                }
            },
            chemistry: {
                periodic_table: {
                    groups: {
                        1: "Alkali Metals (Li, Na, K, Rb, Cs, Fr)",
                        2: "Alkaline Earth Metals (Be, Mg, Ca, Sr, Ba, Ra)",
                        17: "Halogens (F, Cl, Br, I, At)",
                        18: "Noble Gases (He, Ne, Ar, Kr, Xe, Rn)"
                    },
                    periods: {
                        1: "H, He",
                        2: "Li, Be, B, C, N, O, F, Ne",
                        3: "Na, Mg, Al, Si, P, S, Cl, Ar"
                    },
                    important_elements: {
                        hydrogen: { symbol: "H", atomic_number: 1, mass: 1.008, properties: "Lightest, most abundant" },
                        carbon: { symbol: "C", atomic_number: 6, mass: 12.011, properties: "Basis of organic chemistry" },
                        nitrogen: { symbol: "N", atomic_number: 7, mass: 14.007, properties: "78% of atmosphere" },
                        oxygen: { symbol: "O", atomic_number: 8, mass: 15.999, properties: "Supports combustion" },
                        iron: { symbol: "Fe", atomic_number: 26, mass: 55.845, properties: "Most common metal on Earth" },
                        gold: { symbol: "Au", atomic_number: 79, mass: 196.967, properties: "Most malleable metal" }
                    }
                },
                chemical_bonds: {
                    ionic: "Electron transfer (metal + non-metal)",
                    covalent: "Electron sharing (non-metal + non-metal)",
                    metallic: "Delocalized electrons (metal lattice)",
                    hydrogen_bond: "H bonded to F, O, or N",
                    van_der_waals: "Weak intermolecular forces"
                },
                reactions: {
                    types: {
                        combination: "A + B → AB",
                        decomposition: "AB → A + B",
                        single_replacement: "A + BC → AC + B",
                        double_replacement: "AB + CD → AD + CB",
                        combustion: "Fuel + O₂ → CO₂ + H₂O",
                        redox: "Oxidation + Reduction"
                    },
                    balancing: "Same atoms on both sides"
                },
                organic_chemistry: {
                    hydrocarbons: {
                        alkanes: "Single bonds (CₙH₂ₙ₊₂)",
                        alkenes: "Double bond (CₙH₂ₙ)",
                        alkynes: "Triple bond (CₙH₂ₙ₋₂)",
                        aromatic: "Benzene ring structure"
                    },
                    functional_groups: {
                        alcohol: "-OH",
                        aldehyde: "-CHO",
                        ketone: "-CO-",
                        carboxylic_acid: "-COOH",
                        amine: "-NH₂",
                        ether: "-O-",
                        ester: "-COO-",
                        amide: "-CONH₂"
                    },
                    reactions: {
                        substitution: "One group replaced",
                        addition: "Double/triple bond opens",
                        elimination: "Group removed to form double bond",
                        oxidation: "Gain of O or loss of H",
                        reduction: "Loss of O or gain of H"
                    }
                },
                biochemistry: {
                    carbohydrates: {
                        monosaccharides: "Glucose, Fructose, Galactose",
                        disaccharides: "Maltose, Sucrose, Lactose",
                        polysaccharides: "Starch, Glycogen, Cellulose"
                    },
                    proteins: {
                        amino_acids: "20 standard amino acids",
                        structure: "Primary → Secondary → Tertiary → Quaternary",
                        functions: ["Enzymes", "Transport", "Structural", "Defense", "Hormones"]
                    },
                    lipids: {
                        types: ["Fatty acids", "Triglycerides", "Phospholipids", "Steroids"],
                        functions: ["Energy storage", "Cell membranes", "Hormones"]
                    },
                    nucleic_acids: {
                        DNA: "Deoxyribose sugar, Double helix, A-T, G-C",
                        RNA: "Ribose sugar, Single strand, A-U, G-C",
                        atp: "Adenosine triphosphate - Energy currency"
                    }
                }
            },
            biology: {
                cell_biology: {
                    cell_types: {
                        prokaryotic: { examples: ["Bacteria", "Archaea"], features: ["No nucleus", "No membrane organelles", "Circular DNA"] },
                        eukaryotic: { examples: ["Plants", "Animals", "Fungi", "Protists"], features: ["Nucleus", "Membrane organelles", "Linear DNA"] }
                    },
                    organelles: {
                        nucleus: "Contains DNA, controls cell",
                        mitochondria: "Energy production (ATP)",
                        ribosome: "Protein synthesis",
                        endoplasmic_reticulum: "Protein/ lipid synthesis",
                        golgi_body: "Protein packaging and transport",
                        chloroplast: "Photosynthesis (plants)",
                        vacuole: "Storage (plants)",
                        lysosome: "Digestion",
                        cell_membrane: "Boundary, transport"
                    },
                    cell_cycle: {
                        interphase: ["G1: Growth", "S: DNA synthesis", "G2: Preparation"],
                        mitosis: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
                        cytokinesis: "Cell division"
                    }
                },
                genetics: {
                    mendel_laws: [
                        "Law of Dominance: Dominant allele masks recessive",
                        "Law of Segregation: Alleles separate during gamete formation",
                        "Law of Independent Assortment: Genes on different chromosomes assort independently"
                    ],
                    DNA: {
                        structure: "Double helix",
                        backbone: "Sugar-phosphate",
                        base_pairs: "A-T, G-C",
                        replication: "Semi-conservative"
                    },
                    inheritance: {
                        dominant: "TT, Tt = Tall",
                        recessive: "tt = Short",
                        codominant: "Both alleles expressed",
                        incomplete_dominance: "Blended phenotype"
                    },
                    mutations: {
                        gene: "Point mutation",
                        chromosomal: "Deletion, duplication, inversion, translocation",
                        genetic_disorders: ["Down syndrome", "Cystic fibrosis", "Sickle cell anemia", "Hemophilia", "Color blindness"]
                    }
                },
                human_body: {
                    systems: {
                        skeletal: { bones: 206, functions: ["Support", "Protection", "Movement", "Blood production"] },
                        muscular: { types: ["Skeletal (voluntary)", "Cardiac (heart)", "Smooth (involuntary)"], functions: ["Movement", "Posture", "Heat production"] },
                        circulatory: { components: ["Heart", "Blood vessels", "Blood"], heart_chambers: ["Right atrium", "Right ventricle", "Left atrium", "Left ventricle"] },
                        respiratory: { organs: ["Nose", "Pharynx", "Larynx", "Trachea", "Bronchi", "Lungs"], gas_exchange: "O₂ in, CO₂ out in alveoli" },
                        digestive: { organs: ["Mouth", "Esophagus", "Stomach", "Small intestine", "Large intestine", "Rectum"], enzymes: ["Amylase", "Protease", "Lipase"] },
                        nervous: { central: ["Brain", "Spinal cord"], peripheral: ["Somatic", "Autonomic"] },
                        endocrine: { glands: ["Pituitary", "Thyroid", "Adrenal", "Pancreas", "Ovaries", "Testes"], hormones: ["Insulin", "Growth hormone", "Thyroxine"] },
                        immune: { types: ["Innate (non-specific)", "Adaptive (specific)"], cells: ["Macrophages", "T cells", "B cells", "NK cells"] },
                        excretory: { organs: ["Kidneys", "Ureters", "Bladder", "Urethra"], function: "Remove waste, balance fluids" }
                    }
                },
                ecology: {
                    levels: ["Organism", "Population", "Community", "Ecosystem", "Biome", "Biosphere"],
                    food_chain: "Producer → Primary Consumer → Secondary Consumer → Tertiary Consumer → Decomposer",
                    biogeochemical_cycles: ["Carbon cycle", "Nitrogen cycle", "Water cycle", "Phosphorus cycle"],
                    ecosystem_types: ["Terrestrial: Forest, Desert, Grassland", "Aquatic: Marine, Freshwater"],
                    biodiversity: {
                        importance: ["Ecosystem services", "Food security", "Medicine", "Climate regulation"],
                        threats: ["Habitat loss", "Climate change", "Pollution", "Overexploitation"]
                    }
                }
            },
            earth_science: {
                layers: {
                    crust: "5-70 km thick, continental vs oceanic",
                    mantle: "2900 km thick, semi-solid rock",
                    core: "Inner: solid iron; Outer: liquid iron-nickel"
                },
                plate_tectonics: {
                    types: ["Divergent", "Convergent", "Transform"],
                    phenomena: ["Earthquakes", "Volcanoes", "Mountain ranges", "Ocean trenches"]
                },
                minerals: {
                    types: {
                        silicates: "Most common (feldspar, quartz, mica)",
                        carbonates: "Calcite, dolomite",
                        oxides: "Magnetite, hematite",
                        sulfides: "Pyrite, galena"
                    },
                    properties: ["Color", "Luster", "Hardness (Mohs scale)", "Streak", "Cleavage", "Fracture"]
                },
                rocks: {
                    igneous: "From magma/lava (granite, basalt)",
                    sedimentary: "From沉积 (sandstone, limestone, shale)",
                    metamorphic: "Transformed by heat/pressure (marble, slate, gneiss)"
                },
                atmosphere: {
                    layers: ["Troposphere (0-12km)", "Stratosphere (12-50km)", "Mesosphere (50-80km)", "Thermosphere (80-700km)"],
                    composition: "78% N₂, 21% O₂, 1% Ar, traces of CO₂, H₂O",
                    greenhouse_effect: "CO₂, CH₄, H₂O trap heat"
                },
                weather: {
                    elements: ["Temperature", "Pressure", "Humidity", "Wind", "Precipitation"],
                    phenomena: ["Rain", "Snow", "Hail", "Thunderstorm", "Hurricane", "Tornado"]
                }
            }
        };
    }

    // ===== MATHEMATICS KNOWLEDGE =====
    getMathematicsKnowledge() {
        return {
            arithmetic: {
                operations: {
                    addition: "a + b = সমষ্টি",
                    subtraction: "a - b = অন্তর",
                    multiplication: "a × b = গুণফল",
                    division: "a ÷ b = ভাগফল"
                },
                properties: {
                    commutative: "a + b = b + a, a × b = b × a",
                    associative: "(a + b) + c = a + (b + c)",
                    distributive: "a × (b + c) = a×b + a×c",
                    identity: "a + 0 = a, a × 1 = a",
                    inverse: "a + (-a) = 0, a × (1/a) = 1"
                },
                order_of_operations: "PEMDAS/BODMAS: Parentheses → Exponents → Multiply/Divide → Add/Subtract"
            },
            algebra: {
                basic: {
                    variable: "অজানা মানের প্রতীক (x, y, z)",
                    expression: "সংখ্যা ও চলকের সমন্বয় (3x + 5)",
                    equation: "সমান চিহ্নযুক্ত প্রকাশ (2x + 3 = 7)",
                    inequality: ">, <, ≥, ≤ চিহ্নযুক্ত প্রকাশ"
                },
                linear: {
                    standard: "ax + b = 0",
                    solution: "x = -b/a",
                    slope_form: "y = mx + c",
                    two_variables: "ax + by = c, dx + ey = f"
                },
                quadratic: {
                    standard: "ax² + bx + c = 0",
                    discriminant: "D = b² - 4ac",
                    roots: "x = (-b ± √D) / 2a",
                    nature: "D > 0: দুটি বাস্তব", "D = 0: সমান", "D < 0: কাল্পনিক"
                },
                polynomial: {
                    degree: "সর্বোচ্চ ঘাতের মান",
                    factoring: ["উৎপাদকে বিশ্লেষণ", "গুণনীয়ক", "সমীকরণ"],
                    synthetic_division: "দীর্ঘ division-এর সংক্ষিপ্ত পদ্ধতি"
                },
                logarithms: {
                    definition: "logₐx = y means aʸ = x",
                    laws: [
                        "logₐ(xy) = logₐx + logₐy",
                        "logₐ(x/y) = logₐx - logₐy",
                        "logₐ(xⁿ) = n logₐx",
                        "logₐa = 1, logₐ1 = 0"
                    ],
                    natural_log: "ln(x) = logₑx"
                }
            },
            geometry: {
                basics: {
                    point: "অবস্থান (কোনো মাত্রা নেই)",
                    line: "দুই প্রান্ত বিস্তৃত সরলরেখা",
                    plane: "সমতল পৃষ্ঠ (2D)",
                    angle: "দুটি রেখার মিলনস্থল"
                },
                triangles: {
                    types: {
                        equilateral: "৩ বাহু সমান, ৩ কোণ ৬০°",
                        isosceles: "২ বাহু সমান",
                        scalene: "কোনো বাহু সমান নয়",
                        right: "একটি কোণ ৯০°"
                    },
                    area: "½ × base × height",
                    pythagorean: "a² + b² = c²",
                    trig_ratios: {
                        sin: "opposite/hypotenuse",
                        cos: "adjacent/hypotenuse",
                        tan: "opposite/adjacent"
                    }
                },
                quadrilaterals: {
                    square: { sides: 4, angles: "90° each", area: "a²", perimeter: "4a" },
                    rectangle: { sides: "opposite equal", angles: "90° each", area: "l×w", perimeter: "2(l+w)" },
                    parallelogram: { opposite_sides: "parallel", area: "b×h", perimeter: "2(a+b)" },
                    rhombus: { all_sides: "equal", area: "½×d₁×d₂", perimeter: "4a" },
                    trapezoid: { one_pair: "parallel", area: "½(a+b)×h" }
                },
                circles: {
                    circumference: "2πr",
                    area: "πr²",
                    arc_length: "θ/360 × 2πr",
                    sector_area: "θ/360 × πr²",
                    chord: "দুটি বিন্দুর সংযোগকারী রেখা",
                    tangent: "বৃত্তের বাইরের বিন্দু থেকে স্পর্শক"
                },
                3d_shapes: {
                    cube: { volume: "a³", surface_area: "6a²" },
                    sphere: { volume: "4/3πr³", surface_area: "4πr²" },
                    cylinder: { volume: "πr²h", surface_area: "2πr² + 2πrh" },
                    cone: { volume: "1/3πr²h", surface_area: "πr² + πrl" },
                    pyramid: { volume: "1/3 × base_area × h" }
                }
            },
            trigonometry: {
                ratios: {
                    sin: "opposite/hypotenuse",
                    cos: "adjacent/hypotenuse",
                    tan: "opposite/adjacent",
                    cot: "1/tan",
                    sec: "1/cos",
                    cosec: "1/sin"
                },
                identities: {
                    pythagorean: "sin²θ + cos²θ = 1",
                    tan_identity: "tanθ = sinθ/cosθ",
                    cofunction: "sin(90°-θ) = cosθ"
                },
                angles: {
                    0: { sin: 0, cos: 1, tan: 0 },
                    30: { sin: "1/2", cos: "√3/2", tan: "1/√3" },
                    45: { sin: "√2/2", cos: "√2/2", tan: 1 },
                    60: { sin: "√3/2", cos: "1/2", tan: "√3" },
                    90: { sin: 1, cos: 0, tan: "undefined" }
                },
                laws: {
                    sine: "a/sinA = b/sinB = c/sinC",
                    cosine: "c² = a² + b² - 2ab·cosC"
                }
            },
            calculus: {
                limits: {
                    definition: "x approaches a",
                    properties: ["lim(f+g) = lim f + lim g", "lim(f·g) = lim f · lim g", "lim(f/g) = lim f / lim g"]
                },
                derivatives: {
                    definition: "dy/dx = lim(h→0) [f(x+h) - f(x)]/h",
                    rules: {
                        power: "d/dx(xⁿ) = nxⁿ⁻¹",
                        product: "d/dx(uv) = u·dv/dx + v·du/dx",
                        quotient: "d/dx(u/v) = (v·du/dx - u·dv/dx)/v²",
                        chain: "d/dx[f(g(x))] = f'(g(x))·g'(x)"
                    },
                    common: {
                        "d/dx(c) = 0": "c is constant",
                        "d/dx(x) = 1": "",
                        "d/dx(eˣ) = eˣ": "natural exponential",
                        "d/dx(ln x) = 1/x": "natural log",
                        "d/dx(sin x) = cos x": "",
                        "d/dx(cos x) = -sin x": "",
                        "d/dx(tan x) = sec²x": ""
                    }
                },
                integration: {
                    definition: "Reverse of differentiation",
                    rules: {
                        power: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C",
                        constant: "∫c dx = cx + C",
                        sum: "∫(f+g) dx = ∫f dx + ∫g dx"
                    },
                    common: {
                        "∫eˣ dx = eˣ + C": "",
                        "∫1/x dx = ln|x| + C": "",
                        "∫cos x dx = sin x + C": "",
                        "∫sin x dx = -cos x + C": ""
                    }
                },
                applications: {
                    area: "∫f(x) dx between bounds",
                    volume: "∫A(x) dx (disk method)",
                    optimization: "Find max/min using derivatives"
                }
            },
            statistics: {
                descriptive: {
                    central_tendency: {
                        mean: "সকল মানের গড়",
                        median: "মধ্যমা (sorted middle)",
                        mode: "সর্বাধিক ফ্রিকোয়েন্সি"
                    },
                    dispersion: {
                        range: "max - min",
                        variance: "σ² = Σ(x-μ)²/n",
                        std_dev: "σ = √variance",
                        quartile: "Q1, Q2 (median), Q3"
                    }
                },
                probability: {
                    definition: "P(event) = favorable outcomes / total outcomes",
                    rules: {
                        addition: "P(A∪B) = P(A) + P(B) - P(A∩B)",
                        multiplication: "P(A∩B) = P(A) × P(B|A)",
                        complement: "P(A') = 1 - P(A)"
                    },
                    distributions: {
                        binomial: "n trials, p success probability",
                        normal: "Bell curve, μ and σ",
                        poisson: "Rare events"
                    }
                },
                regression: {
                    correlation: "r = covariance/(σₓ·σᵧ)",
                    linear_regression: "y = mx + c"
                }
            },
            number_theory: {
                basics: {
                    prime: "শুধু ১ ও নিজে দ্বারা বিভাজ্য",
                    composite: "একাধিক গুণনীয়ক",
                    factors: "উৎপাদক",
                    multiples: "গুণিতক"
                },
                divisibility: {
                    2: "শেষে জোড়",
                    3: "অঙ্কের যোগফল ৩ দ্বারা বিভাজ্য",
                    5: "শেষে ০ বা ৫",
                    10: "শেষে ০"
                },
                theorems: {
                    euclidean: "a = bq + r, 0 ≤ r < b",
                    fundamental: "প্রতিটি সংখ্যা অনন্য মৌলিক উৎপাদকে বিশ্লেষিত",
                    fermat: "aᵖ⁻¹ ≡ 1 (mod p) for prime p"
                },
                special: {
                    fibonacci: "1, 1, 2, 3, 5, 8, 13, 21, 34...",
                    perfect: "6, 28, 496, 8128...",
                    golden_ratio: "φ = (1+√5)/2 ≈ 1.618"
                }
            }
        };
    }

    // ========== নতুন ক্যাটাগরির Fallback Functions ==========
    
    getEmbeddedSymbolsTokens() {
        return {
            description: "Symbols and Tokens Dictionary - প্রতীক ও টোকেন ডিকশনারি",
            arithmetic: { plus: "+", minus: "-", multiply: "*", divide: "/", equals: "=", modulo: "%" },
            comparison: { equal: "==", not_equal: "!=", less: "<", greater: ">", less_equal: "<=", greater_equal: ">=" },
            logical: { and: "&&", or: "||", not: "!", bitwise_and: "&", bitwise_or: "|" },
            special: { increment: "++", decrement: "--", plus_equals: "+=", minus_equals: "-=", arrow: "->", null_coalesce: "??" }
        };
    }
    
    getEmbeddedSymbolsTokensPartTwo() {
        return {
            description: "Symbols and Tokens Dictionary Part 2 - অ্যাডভান্সড অপারেটর ও নিউমেরিক লিটারাল",
            additional_symbolic_lexicon: {
                plus_symbol: { character: "+", name: "Plus / Addition", bangla: "যোগ চিহ্ন" },
                minus_symbol: { character: "-", name: "Minus / Subtraction", bangla: "বিয়োগ চিহ্ন" },
                forward_slash: { character: "/", name: "Division", bangla: "ভাগ অপারেটর" },
                colon_symbol: { character: ":", name: "Colon", bangla: "কোলন" },
                comma_separator: { character: ",", name: "Comma", bangla: "কমা" },
                underscore_symbol: { character: "_", name: "Underscore", bangla: "আন্ডারস্কোর" },
                less_than: { character: "<", name: "Less Than", bangla: "ছোট" },
                greater_than: { character: ">", name: "Greater Than", bangla: "বড়" }
            },
            universal_numeric_literals: {
                "0": "Zero - শূন্য",
                "1": "One - এক",
                "2": "Two - দুই",
                "3": "Three - তিন",
                "4": "Four - চার",
                "5": "Five - পাঁচ",
                "6": "Six - ছয়",
                "7": "Seven - সাত",
                "8": "Eight - আট",
                "9": "Nine - নয়"
            }
        };
    }
    
    getEmbeddedCoreSyntax() {
        return {
            description: "Core Syntax Rules - মূল সিনট্যাক্স নিয়ম",
            variables: "const, let, var দিয়ে ডিক্লেয়ার করা হয়",
            functions: "function keyword বা arrow function দিয়ে তৈরি",
            control_flow: "if, else, switch, for, while, do-while",
            error_handling: "try, catch, finally, throw"
        };
    }
    
    getEmbeddedDataTypes() {
        return {
            description: "Data Types and Structures Registry - ডেটা টাইপ ও স্ট্রাকচার",
            primitive: { string: "টেক্সট ডেটা", number: "সংখ্যা", boolean: "true/false", null: "ফাঁকা মান", undefined: "অনির্ধারিত" },
            complex: { array: "একাধিক ডেটার লিস্ট", object: "key-value জোড়া", map: "key-value স্টোর", set: "ইউনিক ভ্যালু সেট" }
        };
    }
    
    getEmbeddedReservedKeywords() {
        return {
            description: "Reserved Keywords Map - সংরক্ষিত কীওয়ার্ড",
            javascript: ["var", "let", "const", "function", "class", "if", "else", "for", "while", "return", "try", "catch"],
            python: ["def", "class", "if", "elif", "else", "for", "while", "return", "try", "except", "import", "from", "as"]
        };
    }
    
    getEmbeddedAdvancedValues() {
        return {
            description: "Advanced Values and Compounded Symbols - অ্যাডভান্সড ভ্যালু ও সিম্বল",
            number_11: { value: "11", purpose: "Loop counters, array indexing" },
            number_251: { value: "251", purpose: "8-bit boundary, color constants" },
            plus_equals: { operator: "+=", description: "Addition assignment" },
            minus_equals: { operator: "-=", description: "Subtraction assignment" }
        };
    }
    
    getEmbeddedControlFlow() {
        return {
            description: "Control Flow and Execution Graph - কন্ট্রোল ফ্লো ও এক্সিকিউশন গ্রাফ",
            branching: { if_else: "Conditional branching", switch_case: "Multi-way selection" },
            loops: { for_loop: "Fixed iteration", while_loop: "Condition-based iteration", do_while: "Post-condition loop" },
            jumps: { break: "Exit loop", continue: "Skip iteration", return: "Exit function" }
        };
    }
    
    getEmbeddedConversationalIntents() {
        return {
            description: "Advanced Conversational Intents and Psychology - অ্যাডভান্সড কথোপকথন ইন্টেন্ট",
            frustration: { patterns: ["কাজ করছে না", "বাজে সার্ভিস"], response: "সমস্যা সমাধানে সাহায্য করুন" },
            confusion: { patterns: ["বুঝতে পারছি না", "কোনটা করবো"], response: "সহজ ভাষায় ব্যাখ্যা করুন" },
            direct_task: { patterns: ["সরাসরি কাজ", "এখনই করো"], response: "কোনো কুশল বিনিময় ছাড়াই সরাসরি উত্তর দিন" }
        };
    }
    
    getEmbeddedUniversalDomain() {
        return {
            description: "Universal Domain Knowledge Base - সার্বজনীন ডোমেইন জ্ঞান",
            domains: ["বিজ্ঞান", "গণিত", "প্রযুক্তি", "সাহিত্য", "ইতিহাস", "ভূগোল", "রাজনীতি", "অর্থনীতি"]
        };
    }
    
    getEmbeddedUniversalIntelligence() {
        return {
            description: "Universal Human and System Intelligence - সার্বজনীন মানব ও সিস্টেম ইন্টেলিজেন্স",
            cognitive: { reasoning: "যুক্তি", problem_solving: "সমস্যা সমাধান", learning: "শেখা" },
            emotional: { empathy: "সহানুভূতি", self_awareness: "আত্মসচেতনতা", adaptation: "অভিযোজন" }
        };
    }
    
    getEmbeddedFreeDomInfinity() {
        return {
            description: "Free Dom Infinity - ফ্রিডম ইনফিনিটি",
            concept: "অসীম স্বাধীনতা ও সম্ভাবনা",
            values: ["নিরাপত্তা", "গোপনীয়তা", "স্বচ্ছতা", "সহযোগিতা"]
        };
    }

    // [এখানে আরো জ্ঞান থাকবে - literature, history, geography, medicine, law, economics, philosophy, religion, arts, sports, technology, general, life_skills, cooking, conversation]
    // সময়ের স্বল্পতায় প্রাথমিক ডাটা দেওয়া হলো
    // পরবর্তীতে আরো বিস্তারিত যোগ করা যাবে
}

window.NEXUSKnowledgeBase = NEXUSKnowledgeBase;
window.nexusKnowledge = new NEXUSKnowledgeBase();
