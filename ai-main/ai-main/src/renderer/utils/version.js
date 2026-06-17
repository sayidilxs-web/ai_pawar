/**
 * NEXUS AI - Version Info
 * ভার্সন ইনফো
 */

const Version = {
    major: 1,
    minor: 0,
    patch: 0,
    build: Date.now(),
    
    get version() {
        return `${this.major}.${this.minor}.${this.patch}`;
    },
    
    get fullVersion() {
        return `v${this.version} (${this.build})`;
    },
    
    get releaseDate() {
        return '2024';
    },
    
    get changelog() {
        return [
            { version: '1.0.0', date: '2024', changes: ['Initial release'] },
            { version: '0.1.0', date: '2024', changes: ['Beta version'] }
        ];
    },
    
    isCompatible(minVersion) {
        const parts = minVersion.split('.').map(Number);
        return (
            this.major > parts[0] ||
            (this.major === parts[0] && this.minor > parts[1]) ||
            (this.major === parts[0] && this.minor === parts[1] && this.patch >= parts[2])
        );
    }
};

// Export
window.Version = Version;