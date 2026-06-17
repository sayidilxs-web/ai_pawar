/**
 * NEXUS Knowledge Graph Module
 * Entity relationship storage and querying
 */

class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.entityIndex = new Map();
    }

    addEntity(id, data = {}) {
        const entity = {
            id,
            data,
            type: data.type || 'unknown',
            properties: data.properties || {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.nodes.set(id, entity);
        this.indexEntity(id, data);
        return entity;
    }

    indexEntity(id, data) {
        const keywords = JSON.stringify(data).toLowerCase().split(/\W+/);
        for (const keyword of keywords) {
            if (keyword.length > 2) {
                if (!this.entityIndex.has(keyword)) {
                    this.entityIndex.set(keyword, new Set());
                }
                this.entityIndex.get(keyword).add(id);
            }
        }
    }

    addRelation(from, to, type, properties = {}) {
        if (!this.nodes.has(from)) this.addEntity(from, { type: 'unknown' });
        if (!this.nodes.has(to)) this.addEntity(to, { type: 'unknown' });
        
        const edge = {
            id: `${from}-${type}-${to}`,
            from,
            to,
            type,
            properties,
            weight: properties.weight || 1,
            createdAt: Date.now()
        };
        
        if (!this.edges.has(from)) this.edges.set(from, []);
        this.edges.get(from).push(edge);
        
        return edge;
    }

    getEntity(id) {
        return this.nodes.get(id);
    }

    getNeighbors(entityId, relationType = null, direction = 'outgoing') {
        const edges = this.edges.get(entityId) || [];
        return edges
            .filter(e => {
                if (relationType && e.type !== relationType) return false;
                if (direction === 'outgoing') return true;
                if (direction === 'incoming') return true;
                return true;
            })
            .map(e => ({
                entity: direction === 'incoming' ? e.from : e.to,
                relation: e.type,
                properties: e.properties,
                weight: e.weight
            }));
    }

    getRelations(entityId) {
        const outgoing = this.getNeighbors(entityId, null, 'outgoing');
        const incoming = this.getNeighbors(entityId, null, 'incoming');
        return { outgoing, incoming };
    }

    query(patterns) {
        const results = [];
        
        const traverse = (currentEntity, path, depth) => {
            if (depth >= patterns.length) {
                results.push({ path: [...path], score: path.length / patterns.length });
                return;
            }
            
            const pattern = patterns[depth];
            const neighbors = this.getNeighbors(currentEntity, pattern.relation || null);
            
            for (const neighbor of neighbors) {
                path.push({ entity: neighbor.entity, relation: neighbor.relation });
                traverse(neighbor.entity, path, depth + 1);
                path.pop();
            }
        };
        
        if (patterns.length > 0) {
            traverse(patterns[0].start || '', [], 0);
        }
        
        return results.sort((a, b) => b.score - a.score);
    }

    search(query, limit = 10) {
        const keywords = query.toLowerCase().split(/\W+/).filter(k => k.length > 2);
        const scores = new Map();
        
        for (const keyword of keywords) {
            const matches = this.entityIndex.get(keyword) || new Set();
            
            for (const id of matches) {
                const score = scores.get(id) || 0;
                scores.set(id, score + 1);
            }
        }
        
        return Array.from(scores.entries())
            .map(([id, score]) => ({
                entity: this.nodes.get(id),
                score,
                data: this.nodes.get(id)?.data
            }))
            .filter(r => r.entity)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    recommend(entityId, limit = 5) {
        const neighbors = this.getNeighbors(entityId);
        const scores = new Map();
        
        for (const neighbor of neighbors) {
            const subNeighbors = this.getNeighbors(neighbor.entity);
            
            for (const subNeighbor of subNeighbors) {
                if (subNeighbor.entity !== entityId) {
                    const score = (scores.get(subNeighbor.entity) || 0) + subNeighbor.weight;
                    scores.set(subNeighbor.entity, score);
                }
            }
        }
        
        return Array.from(scores.entries())
            .map(([id, score]) => ({
                entity: this.nodes.get(id),
                score,
                data: this.nodes.get(id)?.data
            }))
            .filter(r => r.entity)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    updateEntity(id, data) {
        if (!this.nodes.has(id)) return null;
        
        const entity = this.nodes.get(id);
        entity.data = { ...entity.data, ...data };
        entity.updatedAt = Date.now();
        
        return entity;
    }

    deleteEntity(id) {
        if (!this.nodes.has(id)) return false;
        
        this.nodes.delete(id);
        this.edges.delete(id);
        
        for (const [entityId, edges] of this.edges) {
            this.edges.set(entityId, edges.filter(e => e.to !== id && e.from !== id));
        }
        
        return true;
    }

    getStats() {
        return {
            entities: this.nodes.size,
            relations: Array.from(this.edges.values()).reduce((sum, edges) => sum + edges.length, 0),
            types: new Set(Array.from(this.nodes.values()).map(e => e.type)).size
        };
    }

    export() {
        return {
            nodes: Object.fromEntries(this.nodes),
            edges: Array.from(this.edges.entries()).map(([k, v]) => [k, v])
        };
    }

    import(data) {
        this.nodes = new Map(Object.entries(data.nodes));
        this.edges = new Map(data.edges);
        
        this.entityIndex.clear();
        for (const [id, entity] of this.nodes) {
            this.indexEntity(id, entity.data);
        }
    }

    clear() {
        this.nodes.clear();
        this.edges.clear();
        this.entityIndex.clear();
    }
}

export { KnowledgeGraph };