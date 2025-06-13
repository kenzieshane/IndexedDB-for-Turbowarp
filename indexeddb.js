class IndexedDBExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.db = null;
        this.dbName = "TurboWarpPersistentDB";
        this.dbVersion = 4; // Incremented version for new features
        this.isInitialized = false;
        this.defaultStore = "default";
        
        this.initializeDB().catch(e => console.warn("Initial DB init:", e));
    }

    async initializeDB() {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.defaultStore)) {
                    db.createObjectStore(this.defaultStore);
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.isInitialized = true;
                resolve();
            };
            
            request.onerror = (event) => {
                console.warn("DB Open Error (fallback to localStorage):", event.target.error);
                this.setupLocalStorageFallback();
                resolve();
            };
        });
    }

    setupLocalStorageFallback() {
        if (!window.localStorage.turbowarp_fallback) {
            window.localStorage.turbowarp_fallback = JSON.stringify({
                stores: {[this.defaultStore]: {}},
                metadata: {defaultStore: this.defaultStore}
            });
        }
    }

    getInfo() {
        return {
            id: 'indexeddb',
            name: 'Persistent Storage',
            blocks: [
                // Basic Blocks (visible)
                {
                    opcode: 'saveData',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'save key [key] value [value]',
                    arguments: {
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
                    text: 'load key [key]',
                    arguments: {
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'player'
                        }
                    }
                },
                {
                    opcode: 'deleteKey',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'delete key [key]',
                    arguments: {
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'temp'
                        }
                    }
                },
                {
                    opcode: 'listKeys',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'list all keys'
                },
                {
                    opcode: 'clearData',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '⚠️ clear ALL data ⚠️',
                    hideFromPalette: true // Hidden by default
                },
                {
                    opcode: 'showDocumentation',
                    blockType: Scratch.BlockType.BUTTON,
                    text: 'Documentation',
                    func: 'showDocs'
                },

                // Advanced Blocks (hidden)
                {
                    opcode: 'saveToStore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'save in store [store] key [key] value [value]',
                    arguments: {
                        store: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'custom'
                        },
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'data'
                        },
                        value: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '{}'
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'loadFromStore',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'load from store [store] key [key]',
                    arguments: {
                        store: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'custom'
                        },
                        key: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'data'
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'createStore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'create store [name]',
                    arguments: {
                        name: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'new_store'
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'deleteStore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'delete store [name]',
                    arguments: {
                        name: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'old_store'
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'listStores',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'list all stores',
                    hideFromPalette: true
                },
                {
                    opcode: 'setDefaultStore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'set default store to [name]',
                    arguments: {
                        name: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'default'
                        }
                    },
                    hideFromPalette: true
                }
            ],
            menus: {
                // Optional: Add menu for documentation links
            }
        };
    }

    showDocs() {
        window.open('https://example.com/docs', '_blank'); // Replace with your docs URL
    }

    // ===== Basic Operations =====
    async saveData(args) {
        return this.saveToStore({
            store: this.defaultStore,
            key: args.key,
            value: args.value
        });
    }

    async loadData(args) {
        return this.loadFromStore({
            store: this.defaultStore,
            key: args.key
        });
    }

    async deleteKey(args) {
        return this.deleteFromStore({
            store: this.defaultStore,
            key: args.key
        });
    }

    async listKeys() {
        return this.listKeysInStore({
            store: this.defaultStore
        });
    }

    // ===== Core Implementation =====
    async saveToStore(args) {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback);
                if (!fallback.stores[args.store]) {
                    fallback.stores[args.store] = {};
                }
                fallback.stores[args.store][args.key] = args.value;
                window.localStorage.turbowarp_fallback = JSON.stringify(fallback);
                return;
            }

            return new Promise((resolve) => {
                const transaction = this.db.transaction(args.store, 'readwrite');
                const store = transaction.objectStore(args.store);
                store.put(args.value, args.key);
                transaction.oncomplete = resolve;
                transaction.onerror = () => resolve();
            });
        } catch (e) {
            console.warn("Save failed:", e);
        }
    }

    async loadFromStore(args) {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback || '{"stores":{}}');
                return fallback.stores[args.store]?.[args.key] || '';
            }

            return new Promise((resolve) => {
                const transaction = this.db.transaction(args.store, 'readonly');
                const store = transaction.objectStore(args.store);
                const request = store.get(args.key);
                
                request.onsuccess = () => {
                    resolve(request.result || '');
                };
                request.onerror = () => resolve('');
            });
        } catch (e) {
            console.warn("Load failed:", e);
            return '';
        }
    }

    async deleteFromStore(args) {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback);
                if (fallback.stores[args.store]) {
                    delete fallback.stores[args.store][args.key];
                    window.localStorage.turbowarp_fallback = JSON.stringify(fallback);
                }
                return;
            }

            return new Promise((resolve) => {
                const transaction = this.db.transaction(args.store, 'readwrite');
                const store = transaction.objectStore(args.store);
                store.delete(args.key);
                transaction.oncomplete = resolve;
                transaction.onerror = () => resolve();
            });
        } catch (e) {
            console.warn("Delete failed:", e);
        }
    }

    async listKeysInStore(args) {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback || '{"stores":{}}');
                const keys = Object.keys(fallback.stores[args.store] || {});
                return JSON.stringify(keys);
            }

            return new Promise((resolve) => {
                const transaction = this.db.transaction(args.store, 'readonly');
                const store = transaction.objectStore(args.store);
                const request = store.getAllKeys();
                
                request.onsuccess = () => {
                    resolve(JSON.stringify(request.result) || '[]');
                };
                request.onerror = () => resolve('[]');
            });
        } catch (e) {
            console.warn("List keys failed:", e);
            return '[]';
        }
    }

    async clearData() {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Clear localStorage fallback
                window.localStorage.turbowarp_fallback = JSON.stringify({
                    stores: {[this.defaultStore]: {}},
                    metadata: {defaultStore: this.defaultStore}
                });
                return;
            }

            return new Promise((resolve) => {
                this.db.close();
                const request = indexedDB.deleteDatabase(this.dbName);
                request.onsuccess = () => {
                    this.db = null;
                    this.isInitialized = false;
                    this.initializeDB().then(resolve);
                };
                request.onerror = () => resolve();
            });
        } catch (e) {
            console.warn("Clear failed:", e);
        }
    }

    async createStore(args) {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback);
                if (!fallback.stores[args.name]) {
                    fallback.stores[args.name] = {};
                    window.localStorage.turbowarp_fallback = JSON.stringify(fallback);
                }
                return;
            }

            return new Promise((resolve) => {
                this.db.close();
                const newVersion = this.dbVersion + 1;
                const request = indexedDB.open(this.dbName, newVersion);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(args.name)) {
                        db.createObjectStore(args.name);
                    }
                };
                
                request.onsuccess = () => {
                    this.dbVersion = newVersion;
                    this.initializeDB().then(resolve);
                };
                
                request.onerror = () => resolve();
            });
        } catch (e) {
            console.warn("Create store failed:", e);
        }
    }

    async deleteStore(args) {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback);
                if (fallback.stores[args.name]) {
                    delete fallback.stores[args.name];
                    window.localStorage.turbowarp_fallback = JSON.stringify(fallback);
                }
                return;
            }

            return new Promise((resolve) => {
                this.db.close();
                const newVersion = this.dbVersion + 1;
                const request = indexedDB.open(this.dbName, newVersion);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (db.objectStoreNames.contains(args.name)) {
                        db.deleteObjectStore(args.name);
                    }
                };
                
                request.onsuccess = () => {
                    this.dbVersion = newVersion;
                    this.initializeDB().then(resolve);
                };
                
                request.onerror = () => resolve();
            });
        } catch (e) {
            console.warn("Delete store failed:", e);
        }
    }

    async listStores() {
        try {
            if (!this.isInitialized) await this.initializeDB();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback || '{"stores":{}}');
                return JSON.stringify(Object.keys(fallback.stores));
            }

            return new Promise((resolve) => {
                resolve(JSON.stringify(Array.from(this.db.objectStoreNames)) || '[]');
            });
        } catch (e) {
            console.warn("List stores failed:", e);
            return '[]';
        }
    }

    async setDefaultStore(args) {
        this.defaultStore = args.name;
        if (!this.isInitialized) {
            const fallback = JSON.parse(window.localStorage.turbowarp_fallback || '{"stores":{},"metadata":{}}');
            fallback.metadata.defaultStore = args.name;
            window.localStorage.turbowarp_fallback = JSON.stringify(fallback);
        }
    }
}

Scratch.extensions.register(new IndexedDBExtension());
