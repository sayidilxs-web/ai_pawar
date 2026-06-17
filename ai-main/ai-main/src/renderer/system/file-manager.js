/**
 * NEXUS File Manager Module
 * File CRUD operations with local storage support
 */

class FileManager {
    constructor() {
        this.currentPath = '/';
        this.history = [];
        this.historyIndex = -1;
        this.clipboard = null;
        this.files = new Map();
    }

    async init(rootPath = '/nexus') {
        this.rootPath = rootPath;
        await this.ensureDirectory(rootPath);
        this.currentPath = rootPath;
        await this.loadDirectory(rootPath);
        return this;
    }

    async ensureDirectory(path) {
        try {
            if (typeof localStorage !== 'undefined') {
                const key = `dir_${path}`;
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, JSON.stringify({
                        type: 'directory',
                        path,
                        createdAt: Date.now(),
                        modifiedAt: Date.now(),
                        children: []
                    }));
                }
            }
            return true;
        } catch (error) {
            console.error('Error creating directory:', error);
            return false;
        }
    }

    async loadDirectory(path) {
        try {
            const key = `dir_${path}`;
            const data = localStorage.getItem(key);
            
            if (data) {
                const dir = JSON.parse(data);
                this.currentPath = path;
                return dir.children.map(name => this.parseFileInfo(path, name));
            }
            
            return [];
        } catch (error) {
            console.error('Error loading directory:', error);
            return [];
        }
    }

    parseFileInfo(dirPath, name) {
        const fileKey = `file_${dirPath}/${name}`;
        const dirKey = `dir_${dirPath}/${name}`;
        
        const fileData = localStorage.getItem(fileKey);
        const dirData = localStorage.getItem(dirKey);
        
        if (fileData) {
            const file = JSON.parse(fileData);
            return { name, type: 'file', size: file.size, modifiedAt: file.modifiedAt };
        }
        
        if (dirData) {
            const dir = JSON.parse(dirData);
            return { name, type: 'directory', size: 0, modifiedAt: dir.modifiedAt };
        }
        
        return { name, type: 'unknown', size: 0, modifiedAt: Date.now() };
    }

    async list(path = this.currentPath) {
        return this.loadDirectory(path);
    }

    async read(path) {
        try {
            const key = `file_${path}`;
            const data = localStorage.getItem(key);
            
            if (data) {
                const file = JSON.parse(data);
                return { success: true, data: file.content, size: file.size };
            }
            
            return { success: false, error: 'File not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async write(path, content) {
        try {
            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            await this.ensureDirectory(parentPath);
            
            const key = `file_${path}`;
            const file = {
                type: 'file',
                path,
                content,
                size: content.length,
                createdAt: Date.now(),
                modifiedAt: Date.now()
            };
            
            localStorage.setItem(key, JSON.stringify(file));
            
            this.addToHistory({ action: 'write', path, content: content.substring(0, 100) });
            
            return { success: true, size: content.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createDirectory(path) {
        try {
            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            await this.ensureDirectory(parentPath);
            
            await this.ensureDirectory(path);
            
            const parentKey = `dir_${parentPath}`;
            const parent = JSON.parse(localStorage.getItem(parentKey) || '{"children":[]}');
            const dirName = path.split('/').pop();
            
            if (!parent.children.includes(dirName)) {
                parent.children.push(dirName);
                parent.modifiedAt = Date.now();
                localStorage.setItem(parentKey, JSON.stringify(parent));
            }
            
            this.addToHistory({ action: 'mkdir', path });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(path) {
        try {
            const key = `file_${path}`;
            const dirKey = `dir_${path}`;
            
            if (localStorage.getItem(dirKey)) {
                const dir = JSON.parse(localStorage.getItem(dirKey));
                for (const child of dir.children) {
                    await this.delete(`${path}/${child}`);
                }
                localStorage.removeItem(dirKey);
            }
            
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
            
            this.addToHistory({ action: 'delete', path });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async copy(source, destination) {
        try {
            const result = await this.read(source);
            if (result.success) {
                await this.write(destination, result.data);
                this.addToHistory({ action: 'copy', from: source, to: destination });
                return { success: true };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async move(source, destination) {
        try {
            const result = await this.copy(source, destination);
            if (result.success) {
                await this.delete(source);
                this.addToHistory({ action: 'move', from: source, to: destination });
                return { success: true };
            }
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async exists(path) {
        const fileKey = `file_${path}`;
        const dirKey = `dir_${path}`;
        return !!(localStorage.getItem(fileKey) || localStorage.getItem(dirKey));
    }

    async search(query, path = '/nexus') {
        const results = [];
        
        const searchDir = async (dirPath) => {
            const key = `dir_${dirPath}`;
            const data = localStorage.getItem(key);
            
            if (!data) return;
            
            const dir = JSON.parse(data);
            
            for (const child of dir.children) {
                const childPath = `${dirPath}/${child}`;
                
                if (child.toLowerCase().includes(query.toLowerCase())) {
                    const fileInfo = this.parseFileInfo(dirPath, child);
                    results.push({ path: childPath, ...fileInfo });
                }
                
                const childDirKey = `dir_${childPath}`;
                if (localStorage.getItem(childDirKey)) {
                    await searchDir(childPath);
                }
            }
        };
        
        await searchDir(path);
        return results;
    }

    getHistory() {
        return this.history;
    }

    addToHistory(action) {
        this.history.push({ ...action, timestamp: Date.now() });
        if (this.history.length > 100) {
            this.history.shift();
        }
    }

    getStats() {
        let totalFiles = 0;
        let totalSize = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('file_')) {
                totalFiles++;
                const data = localStorage.getItem(key);
                try {
                    const file = JSON.parse(data);
                    totalSize += file.size || 0;
                } catch (e) {}
            }
        }
        
        return { totalFiles, totalSize, totalDirectories: this.countDirectories() };
    }

    countDirectories() {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).startsWith('dir_')) {
                count++;
            }
        }
        return count;
    }

    exportAll() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('file_') || key.startsWith('dir_')) {
                data[key] = localStorage.getItem(key);
            }
        }
        return JSON.stringify(data);
    }

    importAll(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, value);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export { FileManager };