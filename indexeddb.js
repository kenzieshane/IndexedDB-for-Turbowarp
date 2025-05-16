class IndexedDBExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.db = null;
        this.dbName = "TurboWarpPersistentDB";
        this.dbVersion = 2; // Version bump for new features
        this.isInitialized = false;
        
        this.initializeDB().catch(e => console.error("Init error:", e));
    }

    async initializeDB() {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('default')) {
                    db.createObjectStore('default');
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.isInitialized = true;
                resolve();
            };
            
            request.onerror = (event) => {
                console.error("DB Error:", event.target.error);
                resolve();
            };
        });
    }

    async verifyConnection() {
        if (!this.isInitialized || !this.db) {
            await this.initializeDB();
        }
    }

    getInfo() {
        return {
            id: 'indexeddb',
            name: 'IndexedDB',
            blocks: [
                {
                    opcode: 'initialize',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'initialize persistent storage'
                },
                {
                    opcode: 'saveData',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'save in [store] key [key] value [value]',
                    arguments: {
                        store: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'default'
                        },
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'player'
                        },
                        value: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '{}'
                        }
                    }
                },
                {
                    opcode: 'loadData',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'load from [store] key [key]',
                    arguments: {
                        store: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'default'
                        },
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'player'
                        }
                    }
                },
                {
                    opcode: 'deleteKey',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'delete from [store] key [key]',
                    arguments: {
                        store: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'default'
                        },
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'player'
                        }
                    }
                },
                {
                    opcode: 'listKeys',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'list all keys in [store]',
                    arguments: {
                        store: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'default'
                        }
                    }
                },
                {
                    opcode: 'clearData',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'clear all data'
                }
            ]
        };
    }

    async initialize() {
        await this.requestPersistence();
        await this.initializeDB();
    }

    async requestPersistence() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                await navigator.storage.persist();
            }
        } catch (e) {
            console.warn("Persistence request failed:", e);
        }
    }

    async saveData(args) {
        await this.verifyConnection();
        return new Promise((resolve) => {
            const transaction = this.db.transaction(args.store, 'readwrite');
            const store = transaction.objectStore(args.store);
            store.put(args.value, args.key);
            transaction.oncomplete = resolve;
            transaction.onerror = () => resolve();
        });
    }

    async loadData(args) {
        await this.verifyConnection();
        return new Promise((resolve) => {
            const transaction = this.db.transaction(args.store, 'readonly');
            const store = transaction.objectStore(args.store);
            const request = store.get(args.key);
            
            request.onsuccess = () => {
                resolve(request.result || '');
            };
            request.onerror = () => resolve('');
        });
    }

    async deleteKey(args) {
        await this.verifyConnection();
        return new Promise((resolve) => {
            const transaction = this.db.transaction(args.store, 'readwrite');
            const store = transaction.objectStore(args.store);
            store.delete(args.key);
            transaction.oncomplete = resolve;
            transaction.onerror = () => resolve();
        });
    }

    async listKeys(args) {
        await this.verifyConnection();
        return new Promise((resolve) => {
            const transaction = this.db.transaction(args.store, 'readonly');
            const store = transaction.objectStore(args.store);
            const request = store.getAllKeys();
            
            request.onsuccess = () => {
                resolve(JSON.stringify(request.result) || '[]');
            };
            request.onerror = () => resolve('[]');
        });
    }

    async clearData() {
        return new Promise((resolve) => {
            if (this.db) this.db.close();
            const request = indexedDB.deleteDatabase(this.dbName);
            request.onsuccess = () => {
                this.db = null;
                this.isInitialized = false;
                this.initializeDB().then(resolve);
            };
            request.onerror = () => resolve();
        });
    }
}

Scratch.extensions.register(new IndexedDBExtension());
