/**
 * NEXUS Voice Commands Module
 * Speech recognition and command handling
 */

class VoiceCommands {
    constructor(options = {}) {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        this.language = options.language || 'en-US';
        this.interimResults = options.interimResults !== false;
        this.maxAlternatives = options.maxAlternatives || 1;
        this.commands = new Map();
        this.listeners = new Map();
        
        this.setupRecognition();
        this.registerDefaultCommands();
    }

    setupRecognition() {
        if (!this.isSupported) {
            console.warn('Speech recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = this.interimResults;
        this.recognition.maxAlternatives = this.maxAlternatives;
        this.recognition.lang = this.language;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.emit('start');
        };

        this.recognition.onresult = (event) => {
            const results = [];
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const alternatives = [];
                
                for (let j = 0; j < result.length; j++) {
                    alternatives.push(result[j].transcript);
                }
                
                results.push({
                    transcript: result[0].transcript,
                    alternatives,
                    isFinal: result.isFinal,
                    confidence: result[0].confidence
                });
            }
            
            this.emit('result', { results });
            
            if (results[results.length - 1].isFinal) {
                this.processResults(results);
            }
        };

        this.recognition.onerror = (event) => {
            this.emit('error', { error: event.error });
            
            if (event.error === 'not-allowed') {
                console.error('Microphone access denied');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.emit('end');
        };
    }

    registerDefaultCommands() {
        this.registerCommand('search', /^search\s+(?:for\s+)?(.+)/i, (matches) => {
            return { action: 'search', query: matches[1] };
        });

        this.registerCommand('open', /^open\s+(?:the\s+)?(.+)/i, (matches) => {
            return { action: 'open', target: matches[1] };
        });

        this.registerCommand('close', /^close\s+(?:the\s+)?(.+)/i, (matches) => {
            return { action: 'close', target: matches[1] };
        });

        this.registerCommand('play', /^play\s+(.+)/i, (matches) => {
            return { action: 'play', media: matches[1] };
        });

        this.registerCommand('pause', /^(?:pause|stop)/i, () => {
            return { action: 'pause' };
        });

        this.registerCommand('volume', /^(?:volume|set volume)\s+(\d+|up|down)/i, (matches) => {
            let level;
            if (matches[1] === 'up') level = 'up';
            else if (matches[1] === 'down') level = 'down';
            else level = parseInt(matches[1]);
            return { action: 'volume', level };
        });

        this.registerCommand('remind', /^remind\s+(?:me\s+)?(.+)/i, (matches) => {
            return { action: 'remind', message: matches[1] };
        });

        this.registerCommand('weather', /^(?:what(?:'s|s)\s+)?the\s+weather(?:\s+in\s+(.+))?/i, (matches) => {
            return { action: 'weather', location: matches[1] || 'current' };
        });

        this.registerCommand('time', /^what(?:'s|s)\s+the\s+time/i, () => {
            return { action: 'time' };
        });

        this.registerCommand('date', /^what(?:'s|s)\s+the\s+date/i, () => {
            return { action: 'date' };
        });

        this.registerCommand('toggleTheme', /^(?:toggle|switch)\s+(?:dark\s+)?mode/i, () => {
            return { action: 'toggleTheme' };
        });

        this.registerCommand('clear', /^clear\s+(?:all\s+)?(?:chat|conversation)/i, () => {
            return { action: 'clearChat' };
        });

        this.registerCommand('help', /^(?:help|commands|what can you do)/i, () => {
            return { action: 'showHelp' };
        });
    }

    registerCommand(name, pattern, handler) {
        this.commands.set(name, { pattern, handler, name });
    }

    unregisterCommand(name) {
        return this.commands.delete(name);
    }

    start() {
        if (!this.isSupported || this.isListening) {
            return false;
        }

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start recognition:', error);
            return false;
        }
    }

    stop() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    processResults(results) {
        const finalTranscript = results
            .filter(r => r.isFinal)
            .map(r => r.transcript)
            .join(' ')
            .trim();

        if (!finalTranscript) return;

        this.emit('transcript', { transcript: finalTranscript });

        for (const [name, command] of this.commands) {
            const match = finalTranscript.match(command.pattern);
            
            if (match) {
                try {
                    const result = command.handler(match);
                    this.emit('command', { command: name, result, transcript: finalTranscript });
                } catch (error) {
                    console.error(`Command ${name} failed:`, error);
                }
                return;
            }
        }

        this.emit('unknown', { transcript: finalTranscript });
    }

    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }

    getCommands() {
        return Array.from(this.commands.keys());
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(data);
            }
        }
    }

    isAvailable() {
        return this.isSupported;
    }

    getIsListening() {
        return this.isListening;
    }
}

// Voice Synthesis Module
class VoiceSynthesis {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.listeners = new Map();
        
        this.loadVoices();
    }

    loadVoices() {
        if (this.synth) {
            this.voices = this.synth.getVoices();
            
            if (this.voices.length === 0) {
                this.synth.onvoiceschanged = () => {
                    this.voices = this.synth.getVoices();
                    this.selectDefaultVoice();
                };
            } else {
                this.selectDefaultVoice();
            }
        }
    }

    selectDefaultVoice() {
        const preferredLang = 'en';
        this.currentVoice = this.voices.find(v => v.lang.startsWith(preferredLang)) || this.voices[0];
    }

    speak(text, options = {}) {
        if (!this.synth) {
            return Promise.reject(new Error('Speech synthesis not supported'));
        }

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            
            if (options.voice) {
                const voice = this.voices.find(v => 
                    v.name === options.voice || v.lang === options.voice
                );
                if (voice) utterance.voice = voice;
            } else if (this.currentVoice) {
                utterance.voice = this.currentVoice;
            }

            utterance.rate = options.rate || this.rate;
            utterance.pitch = options.pitch || this.pitch;
            utterance.volume = options.volume || this.volume;

            utterance.onstart = () => this.emit('start', { text });
            utterance.onend = () => {
                this.emit('end', { text });
                resolve();
            };
            utterance.onerror = (e) => {
                this.emit('error', { error: e.error });
                reject(e);
            };

            this.synth.speak(utterance);
        });
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.emit('stop');
        }
    }

    pause() {
        if (this.synth) {
            this.synth.pause();
            this.emit('pause');
        }
    }

    resume() {
        if (this.synth) {
            this.synth.resume();
            this.emit('resume');
        }
    }

    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.currentVoice = voice;
            return true;
        }
        return false;
    }

    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    getVoices() {
        return this.voices.map(v => ({
            name: v.name,
            lang: v.lang,
            localService: v.localService
        }));
    }

    getSettings() {
        return {
            voice: this.currentVoice?.name,
            rate: this.rate,
            pitch: this.pitch,
            volume: this.volume
        };
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(data);
            }
        }
    }
}

export { VoiceCommands, VoiceSynthesis };