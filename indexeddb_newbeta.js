class IndexedDBExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.db = null;
        this.dbName = "TurboWarpPersistentDB";
        this.dbVersion = 3; // Incremented version
        this.isInitialized = false;
        
        // More robust initialization
        this.initializeDB().catch(e => {
            console.warn("Initial DB init failed, will retry on first use:", e);
        });
    }

    async initializeDB() {
        return new Promise((resolve) => {
            // Skip if already initialized
            if (this.isInitialized) {
                resolve();
                return;
            }

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
                
                // Add error handling for transactions
                this.db.onerror = (event) => {
                    console.error("Database error:", event.target.error);
                };
                
                resolve();
            };
            
            request.onerror = (event) => {
                console.error("DB Open Error:", event.target.error);
                // Fallback to localStorage if IndexedDB fails completely
                if (!window.localStorage.turbowarp_fallback) {
                    console.warn("Falling back to localStorage");
                    window.localStorage.turbowarp_fallback = "{}";
                }
                resolve();
            };
        });
    }

    async verifyConnection() {
        if (!this.isInitialized) {
            try {
                await this.initializeDB();
            } catch (e) {
                console.warn("Connection verification failed:", e);
            }
        }
    }

    getInfo() {
        return {
            id: 'indexeddb',
            name: 'Persistent Storage',
            blocks: [
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
                    opcode: 'isAvailable',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'persistent storage available?'
                }
            ]
        };
    }

    async saveData(args) {
        try {
            await this.verifyConnection();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback || "{}");
                fallback[args.key] = args.value;
                window.localStorage.turbowarp_fallback = JSON.stringify(fallback);
                return;
            }

            return new Promise((resolve) => {
                const transaction = this.db.transaction(args.store, 'readwrite');
                const store = transaction.objectStore(args.store);
                store.put(args.value, args.key);
                transaction.oncomplete = resolve;
                transaction.onerror = (e) => {
                    console.warn("Transaction error:", e);
                    resolve();
                };
            });
        } catch (e) {
            console.warn("Save failed:", e);
        }
    }

    async loadData(args) {
        try {
            await this.verifyConnection();
            
            if (!this.isInitialized) {
                // Fallback to localStorage
                const fallback = JSON.parse(window.localStorage.turbowarp_fallback || "{}");
                return fallback[args.key] || '';
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

    isAvailable() {
        return this.isInitialized;
    }
}

Scratch.extensions.register(new IndexedDBExtension());
