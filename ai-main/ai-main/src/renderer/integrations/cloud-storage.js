/**
 * NEXUS Cloud Storage Module
 * Google Drive & Dropbox sync support
 */

class CloudStorage {
    constructor(provider = 'local') {
        this.provider = provider;
        this.accessToken = null;
        this.files = new Map();
        this.syncQueue = [];
        this.syncing = false;
        this.lastSync = null;
    }

    async authenticate(provider, token) {
        this.provider = provider;
        this.accessToken = token;
        
        switch (provider) {
            case 'google':
                return this.authenticateGoogle(token);
            case 'dropbox':
                return this.authenticateDropbox(token);
            default:
                return { success: true, provider: 'local' };
        }
    }

    async authenticateGoogle(token) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            const user = await response.json();
            
            return {
                success: true,
                provider: 'google',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async authenticateDropbox(token) {
        try {
            const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            const user = await response.json();
            
            return {
                success: true,
                provider: 'dropbox',
                user: {
                    id: user.account_id,
                    name: user.name.display_name,
                    email: user.email
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async upload(path, data, options = {}) {
        const { name = path.split('/').pop(), type = 'file' } = options;

        if (this.provider === 'local') {
            const key = `cloud_${path}`;
            const content = typeof data === 'string' ? data : JSON.stringify(data);
            localStorage.setItem(key, content);
            
            this.files.set(path, {
                path,
                name,
                type,
                size: content.length,
                uploadedAt: Date.now(),
                modifiedAt: Date.now()
            });

            return { success: true, path };
        }

        if (this.provider === 'google') {
            return this.uploadGoogleDrive(path, data, options);
        }

        if (this.provider === 'dropbox') {
            return this.uploadDropbox(path, data, options);
        }

        return { success: false, error: 'Unknown provider' };
    }

    async uploadGoogleDrive(path, data, options = {}) {
        try {
            const metadata = {
                name: options.name || path.split('/').pop(),
                mimeType: options.mimeType || 'application/octet-stream'
            };

            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            formData.append('file', new Blob([data]));

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.accessToken}` },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                fileId: result.id,
                path: result.name,
                webViewLink: result.webViewLink
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async uploadDropbox(path, data, options = {}) {
        try {
            const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        path: `/${path}`,
                        mode: 'add',
                        autorename: true,
                        mute: false
                    }),
                    'Content-Type': 'application/octet-stream'
                },
                body: data
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                path: result.path_display,
                size: result.size,
                modified: result.server_modified
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async download(path) {
        if (this.provider === 'local') {
            const key = `cloud_${path}`;
            const data = localStorage.getItem(key);
            
            if (data === null) {
                return { success: false, error: 'File not found' };
            }

            return { success: true, data };
        }

        if (this.provider === 'google') {
            return this.downloadGoogleDrive(path);
        }

        if (this.provider === 'dropbox') {
            return this.downloadDropbox(path);
        }

        return { success: false, error: 'Unknown provider' };
    }

    async downloadGoogleDrive(fileId) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
            );

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            const data = await response.text();

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async downloadDropbox(path) {
        try {
            const response = await fetch('https://content.dropboxapi.com/2/files/download', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Dropbox-API-Arg': JSON.stringify({ path })
                }
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            const data = await response.text();

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async list(path = '') {
        if (this.provider === 'local') {
            const files = [];
            
            for (const [key, meta] of this.files) {
                if (key.startsWith(`cloud_${path}`)) {
                    files.push(meta);
                }
            }

            return { success: true, files };
        }

        if (this.provider === 'google') {
            return this.listGoogleDrive(path);
        }

        if (this.provider === 'dropbox') {
            return this.listDropbox(path);
        }

        return { success: false, error: 'Unknown provider' };
    }

    async listGoogleDrive(folderId = 'root') {
        try {
            let query = "trashed = false";
            if (folderId !== 'root') {
                query += ` and '${folderId}' in parents`;
            }

            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime)`,
                { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
            );

            if (!response.ok) {
                throw new Error(`List failed: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                files: result.files.map(f => ({
                    id: f.id,
                    name: f.name,
                    type: f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
                    size: parseInt(f.size) || 0,
                    modified: f.modifiedTime
                }))
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async listDropbox(path = '') {
        try {
            const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: path || '' })
            });

            if (!response.ok) {
                throw new Error(`List failed: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                files: result.entries.map(e => ({
                    name: e.name,
                    path: e.path_display,
                    type: e['.tag'],
                    modified: e.server_modified
                }))
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async delete(path) {
        if (this.provider === 'local') {
            const key = `cloud_${path}`;
            localStorage.removeItem(key);
            this.files.delete(path);
            return { success: true };
        }

        if (this.provider === 'google') {
            return this.deleteGoogleDrive(path);
        }

        if (this.provider === 'dropbox') {
            return this.deleteDropbox(path);
        }

        return { success: false, error: 'Unknown provider' };
    }

    async deleteGoogleDrive(fileId) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }
            );

            if (!response.ok && response.status !== 204) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteDropbox(path) {
        try {
            const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path })
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    addToSyncQueue(operation) {
        this.syncQueue.push({
            ...operation,
            id: Date.now() + Math.random(),
            status: 'pending'
        });
        
        if (!this.syncing) {
            this.processSyncQueue();
        }
    }

    async processSyncQueue() {
        if (this.syncing || this.syncQueue.length === 0) return;
        
        this.syncing = true;
        
        while (this.syncQueue.length > 0) {
            const operation = this.syncQueue[0];
            
            try {
                operation.status = 'syncing';
                let result;
                
                switch (operation.type) {
                    case 'upload':
                        result = await this.upload(operation.path, operation.data, operation.options);
                        break;
                    case 'delete':
                        result = await this.delete(operation.path);
                        break;
                }
                
                if (result.success) {
                    operation.status = 'completed';
                    operation.result = result;
                } else {
                    operation.status = 'failed';
                    operation.error = result.error;
                }
            } catch (error) {
                operation.status = 'failed';
                operation.error = error.message;
            }
            
            this.syncQueue.shift();
        }
        
        this.syncing = false;
        this.lastSync = Date.now();
    }

    getSyncStatus() {
        return {
            syncing: this.syncing,
            queueLength: this.syncQueue.length,
            lastSync: this.lastSync,
            provider: this.provider
        };
    }
}

export { CloudStorage };