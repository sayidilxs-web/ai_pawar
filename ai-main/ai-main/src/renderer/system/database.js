/**
 * NEXUS Database Module
 * SQLite-like database with IndexedDB support
 */

class Database {
    constructor(name = 'nexus_db') {
        this.name = name;
        this.tables = new Map();
        this.db = null;
        this.connected = false;
    }

    async connect() {
        if (typeof indexedDB !== 'undefined') {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.name, 1);
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    this.db = request.result;
                    this.connected = true;
                    this.loadTables();
                    resolve(this);
                };
                
                request.onupgradeneeded = (event) => {
                    this.db = event.target.result;
                };
            });
        } else {
            // Fallback to localStorage
            this.loadFromStorage();
            this.connected = true;
            return this;
        }
    }

    loadTables() {
        if (!this.db) return;
        
        const tables = localStorage.getItem(`db_${this.name}_tables`);
        if (tables) {
            const tableNames = JSON.parse(tables);
            for (const name of tableNames) {
                this.loadTable(name);
            }
        }
    }

    loadTable(tableName) {
        const data = localStorage.getItem(`db_${this.name}_${tableName}`);
        if (data) {
            this.tables.set(tableName, JSON.parse(data));
        }
    }

    saveTable(tableName) {
        const table = this.tables.get(tableName);
        if (table) {
            localStorage.setItem(`db_${this.name}_${tableName}`, JSON.stringify(table));
            
            const tables = Array.from(this.tables.keys());
            localStorage.setItem(`db_${this.name}_tables`, JSON.stringify(tables));
        }
    }

    loadFromStorage() {
        const tables = localStorage.getItem(`db_${this.name}_tables`);
        if (tables) {
            const tableNames = JSON.parse(tables);
            for (const name of tableNames) {
                this.loadTable(name);
            }
        }
    }

    createTable(tableName, schema) {
        if (this.tables.has(tableName)) {
            return { success: false, error: 'Table already exists' };
        }
        
        this.tables.set(tableName, {
            name: tableName,
            schema: schema,
            rows: [],
            indices: new Map(),
            autoIncrement: schema.autoIncrement || 'id'
        });
        
        this.saveTable(tableName);
        return { success: true };
    }

    dropTable(tableName) {
        if (!this.tables.has(tableName)) {
            return { success: false, error: 'Table not found' };
        }
        
        this.tables.delete(tableName);
        localStorage.removeItem(`db_${this.name}_${tableName}`);
        
        const tables = Array.from(this.tables.keys());
        localStorage.setItem(`db_${this.name}_tables`, JSON.stringify(tables));
        
        return { success: true };
    }

    insert(tableName, data) {
        const table = this.tables.get(tableName);
        if (!table) {
            return { success: false, error: 'Table not found' };
        }
        
        const row = { ...data };
        
        if (table.autoIncrement && !row[table.autoIncrement]) {
            const maxId = table.rows.reduce((max, r) => Math.max(max, r[table.autoIncrement] || 0), 0);
            row[table.autoIncrement] = maxId + 1;
        }
        
        row._createdAt = Date.now();
        row._updatedAt = Date.now();
        
        table.rows.push(row);
        this.updateIndices(tableName, row);
        this.saveTable(tableName);
        
        return { success: true, id: row[table.autoIncrement] || row.id };
    }

    insertMany(tableName, dataArray) {
        const results = [];
        for (const data of dataArray) {
            results.push(this.insert(tableName, data));
        }
        return results;
    }

    select(tableName, conditions = {}, options = {}) {
        const table = this.tables.get(tableName);
        if (!table) {
            return { success: false, error: 'Table not found', data: [] };
        }
        
        let results = table.rows.filter(row => this.matchConditions(row, conditions));
        
        if (options.orderBy) {
            const [field, order] = options.orderBy.split(' ');
            results.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                if (order === 'DESC') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        }
        
        if (options.limit) {
            results = results.slice(0, options.limit);
        }
        
        if (options.offset) {
            results = results.slice(options.offset);
        }
        
        return { success: true, data: results, count: results.length };
    }

    matchConditions(row, conditions) {
        for (const [key, value] of Object.entries(conditions)) {
            if (key === 'OR') {
                if (!Array.isArray(value)) continue;
                if (!value.some(cond => this.matchConditions(row, cond))) {
                    return false;
                }
            } else if (key === 'AND') {
                if (!Array.isArray(value)) continue;
                if (!value.every(cond => this.matchConditions(row, cond))) {
                    return false;
                }
            } else if (key === 'LIMIT' || key === 'OFFSET' || key === 'ORDER') {
                continue;
            } else if (typeof value === 'object') {
                if (value.$gt !== undefined && !(row[key] > value.$gt)) return false;
                if (value.$gte !== undefined && !(row[key] >= value.$gte)) return false;
                if (value.$lt !== undefined && !(row[key] < value.$lt)) return false;
                if (value.$lte !== undefined && !(row[key] <= value.$lte)) return false;
                if (value.$ne !== undefined && row[key] === value.$ne) return false;
                if (value.$like !== undefined) {
                    const regex = new RegExp(value.$like.replace(/%/g, '.*'), 'i');
                    if (!regex.test(row[key])) return false;
                }
                if (value.$in !== undefined && !value.$in.includes(row[key])) return false;
                if (value.$nin !== undefined && value.$nin.includes(row[key])) return false;
            } else {
                if (row[key] !== value) return false;
            }
        }
        return true;
    }

    update(tableName, conditions, data) {
        const table = this.tables.get(tableName);
        if (!table) {
            return { success: false, error: 'Table not found' };
        }
        
        let updatedCount = 0;
        
        for (const row of table.rows) {
            if (this.matchConditions(row, conditions)) {
                Object.assign(row, data);
                row._updatedAt = Date.now();
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            this.saveTable(tableName);
        }
        
        return { success: true, updated: updatedCount };
    }

    delete(tableName, conditions) {
        const table = this.tables.get(tableName);
        if (!table) {
            return { success: false, error: 'Table not found' };
        }
        
        const originalLength = table.rows.length;
        table.rows = table.rows.filter(row => !this.matchConditions(row, conditions));
        const deletedCount = originalLength - table.rows.length;
        
        if (deletedCount > 0) {
            this.saveTable(tableName);
        }
        
        return { success: true, deleted: deletedCount };
    }

    query(sql) {
        // Simple SQL parser for basic queries
        const normalized = sql.trim().toUpperCase();
        
        if (normalized.startsWith('SELECT')) {
            return this.parseSelect(sql);
        } else if (normalized.startsWith('INSERT')) {
            return this.parseInsert(sql);
        } else if (normalized.startsWith('UPDATE')) {
            return this.parseUpdate(sql);
        } else if (normalized.startsWith('DELETE')) {
            return this.parseDelete(sql);
        } else if (normalized.startsWith('CREATE TABLE')) {
            return this.parseCreateTable(sql);
        }
        
        return { success: false, error: 'Unsupported SQL command' };
    }

    parseSelect(sql) {
        const match = sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?/i);
        if (!match) {
            return { success: false, error: 'Invalid SELECT syntax' };
        }
        
        const [, fields, tableName, where, orderBy, limit] = match;
        const columns = fields === '*' ? {} : {};
        
        const options = {};
        if (orderBy) options.orderBy = orderBy;
        if (limit) options.limit = parseInt(limit);
        
        const conditions = where ? this.parseWhere(where) : {};
        
        return this.select(tableName, conditions, options);
    }

    parseInsert(sql) {
        const match = sql.match(/INSERT\s+INTO\s+(\w+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/i);
        if (!match) {
            return { success: false, error: 'Invalid INSERT syntax' };
        }
        
        const [, tableName, fields, values] = match;
        const fieldNames = fields.split(',').map(f => f.trim());
        const fieldValues = values.split(',').map(v => this.parseValue(v.trim()));
        
        const data = {};
        fieldNames.forEach((name, i) => {
            data[name] = fieldValues[i];
        });
        
        return this.insert(tableName, data);
    }

    parseUpdate(sql) {
        const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
        if (!match) {
            return { success: false, error: 'Invalid UPDATE syntax' };
        }
        
        const [, tableName, setClause, where] = match;
        const sets = this.parseSet(setClause);
        const conditions = this.parseWhere(where);
        
        return this.update(tableName, conditions, sets);
    }

    parseDelete(sql) {
        const match = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
        if (!match) {
            return { success: false, error: 'Invalid DELETE syntax' };
        }
        
        const [, tableName, where] = match;
        const conditions = where ? this.parseWhere(where) : {};
        
        return this.delete(tableName, conditions);
    }

    parseCreateTable(sql) {
        const match = sql.match(/CREATE\s+TABLE\s+(\w+)\s*\((.+)\)/i);
        if (!match) {
            return { success: false, error: 'Invalid CREATE TABLE syntax' };
        }
        
        const [, tableName, columns] = match;
        const schema = { columns: [] };
        
        const colDefs = columns.split(',');
        for (const col of colDefs) {
            const parts = col.trim().split(/\s+/);
            schema.columns.push({ name: parts[0], type: parts[1] || 'TEXT' });
        }
        
        return this.createTable(tableName, schema);
    }

    parseWhere(str) {
        const conditions = {};
        const parts = str.split(/\s+AND\s+/i);
        
        for (const part of parts) {
            const match = part.match(/(\w+)\s*(=|>|<|>=|<=|!=|LIKE)\s*(.+)/i);
            if (match) {
                const [, field, op, value] = match;
                if (op === '=') {
                    conditions[field] = this.parseValue(value);
                } else if (op === 'LIKE') {
                    conditions[field] = { $like: this.parseValue(value) };
                } else {
                    const opMap = { '>': '$gt', '>=': '$gte', '<': '$lt', '<=': '$lte', '!=': '$ne' };
                    conditions[field] = { [opMap[op]]: this.parseValue(value) };
                }
            }
        }
        
        return conditions;
    }

    parseSet(str) {
        const data = {};
        const parts = str.split(',');
        
        for (const part of parts) {
            const match = part.match(/(\w+)\s*=\s*(.+)/);
            if (match) {
                data[match[1]] = this.parseValue(match[2]);
            }
        }
        
        return data;
    }

    parseValue(str) {
        str = str.trim();
        if (str === 'NULL' || str === 'null') return null;
        if (str === 'TRUE' || str === 'true') return true;
        if (str === 'FALSE' || str === 'false') return false;
        if (str.startsWith("'") && str.endsWith("'")) return str.slice(1, -1);
        if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1);
        if (!isNaN(str)) return Number(str);
        return str;
    }

    updateIndices(tableName, row) {
        const table = this.tables.get(tableName);
        if (!table) return;
        
        for (const [indexName, fields] of table.indices) {
            const key = fields.map(f => row[f]).join('_');
            if (!table.rows.some(r => r !== row && fields.map(f => r[f]).join('_') === key)) {
                // Unique constraint check could go here
            }
        }
    }

    createIndex(tableName, indexName, fields) {
        const table = this.tables.get(tableName);
        if (!table) {
            return { success: false, error: 'Table not found' };
        }
        
        table.indices.set(indexName, Array.isArray(fields) ? fields : [fields]);
        this.saveTable(tableName);
        
        return { success: true };
    }

    getTableInfo(tableName) {
        const table = this.tables.get(tableName);
        if (!table) {
            return { success: false, error: 'Table not found' };
        }
        
        return {
            success: true,
            name: table.name,
            schema: table.schema,
            rowCount: table.rows.length,
            indices: Array.from(table.indices.keys())
        };
    }

    listTables() {
        return {
            success: true,
            tables: Array.from(this.tables.keys()).map(name => this.getTableInfo(name))
        };
    }

    exportDatabase() {
        const data = {};
        for (const [name, table] of this.tables) {
            data[name] = table;
        }
        return JSON.stringify(data);
    }

    importDatabase(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            for (const [name, table] of Object.entries(data)) {
                this.tables.set(name, table);
                this.saveTable(name);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        this.connected = false;
    }
}

export { Database };