class IndexedDBExtension {
  constructor(runtime) {
    this.runtime = runtime;
    this.databases = {};
    this.currentDB = null;
  }

  getInfo() {
    return {
      id: 'indexeddb',
      name: 'IndexedDB',
      blocks: [
        // Database Management
        {
          opcode: 'openDatabase',
          blockType: Scratch.BlockType.COMMAND,
          text: 'open database [name] version [version]',
          arguments: {
            name: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'scratch_data'
            },
            version: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 1
            }
          }
        },
        {
          opcode: 'deleteDatabase',
          blockType: Scratch.BlockType.COMMAND,
          text: 'delete entire database [name]',
          arguments: {
            name: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'scratch_data'
            }
          }
        },
        {
          opcode: 'listDatabases',
          blockType: Scratch.BlockType.REPORTER,
          text: 'list all databases'
        },

        // Store Management
        {
          opcode: 'listStores',
          blockType: Scratch.BlockType.REPORTER,
          text: 'list all stores in current database'
        },
        {
          opcode: 'createStore',
          blockType: Scratch.BlockType.COMMAND,
          text: 'create store [storeName] with options [options]',
          arguments: {
            storeName: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'new_store'
            },
            options: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'keyPath: "id", autoIncrement: true'
            }
          }
        },
        {
          opcode: 'deleteStore',
          blockType: Scratch.BlockType.COMMAND,
          text: 'delete store [storeName]',
          arguments: {
            storeName: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'old_data'
            }
          }
        },
        {
          opcode: 'countRecords',
          blockType: Scratch.BlockType.REPORTER,
          text: 'count records in [storeName]',
          arguments: {
            storeName: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'default'
            }
          }
        },
        {
          opcode: 'clearStore',
          blockType: Scratch.BlockType.COMMAND,
          text: 'clear ALL records in [storeName]',
          arguments: {
            storeName: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'default'
            }
          }
        },

        // Data Operations
        {
          opcode: 'storeData',
          blockType: Scratch.BlockType.COMMAND,
          text: 'store in [storeName] key [key] value [value]',
          arguments: {
            storeName: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'default'
            },
            key: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'myKey'
            },
            value: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'myValue'
            }
          }
        },
        {
          opcode: 'getData',
          blockType: Scratch.BlockType.REPORTER,
          text: 'get from [storeName] key [key]',
          arguments: {
            storeName: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'default'
            },
            key: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'myKey'
            }
          }
        }
      ],
      menus: {
        options: {
          acceptReporters: true,
          items: [
            'keyPath: "id", autoIncrement: false',
            'keyPath: "id", autoIncrement: true',
            'keyPath: null, autoIncrement: true'
          ]
        }
      }
    };
  }

  // Database Operations
  openDatabase(args) {
    return new Promise((resolve) => {
      const request = indexedDB.open(args.name, args.version);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('default')) {
          db.createObjectStore('default');
        }
      };
      
      request.onsuccess = (event) => {
        this.currentDB = event.target.result;
        this.databases[args.name] = this.currentDB;
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        resolve();
      };
    });
  }

  deleteDatabase(args) {
    return new Promise((resolve) => {
      if (this.currentDB && this.currentDB.name === args.name) {
        this.currentDB.close();
        this.currentDB = null;
      }
      
      const request = indexedDB.deleteDatabase(args.name);
      
      request.onsuccess = () => {
        delete this.databases[args.name];
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Delete error:', event.target.error);
        resolve();
      };
    });
  }

  listDatabases() {
    return new Promise((resolve) => {
      // Note: This uses a non-standard but widely supported method
      if (indexedDB.databases) {
        indexedDB.databases().then(dbs => {
          resolve(dbs.map(db => db.name).join(', '));
        }).catch(() => resolve(''));
      } else {
        // Fallback: Only list databases we've opened
        resolve(Object.keys(this.databases).join(', '));
      }
    });
  }

  // Store Operations
  listStores() {
    if (!this.currentDB) return '';
    return Array.from(this.currentDB.objectStoreNames).join(', ');
  }

  createStore(args) {
    return new Promise((resolve) => {
      if (!this.currentDB) {
        resolve();
        return;
      }
      
      const db = this.currentDB;
      const version = db.version + 1;
      db.close();
      
      const req = indexedDB.open(db.name, version);
      
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(args.storeName)) {
          try {
            const options = JSON.parse(`{${args.options}}`);
            db.createObjectStore(args.storeName, options);
          } catch (e) {
            db.createObjectStore(args.storeName);
          }
        }
      };
      
      req.onsuccess = (event) => {
        this.currentDB = event.target.result;
        this.databases[db.name] = this.currentDB;
        resolve();
      };
    });
  }

  deleteStore(args) {
    return new Promise((resolve) => {
      if (!this.currentDB) {
        resolve();
        return;
      }
      
      const db = this.currentDB;
      const version = db.version + 1;
      db.close();
      
      const req = indexedDB.open(db.name, version);
      
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains(args.storeName)) {
          db.deleteObjectStore(args.storeName);
        }
      };
      
      req.onsuccess = (event) => {
        this.currentDB = event.target.result;
        resolve();
      };
    });
  }

  countRecords(args) {
    return new Promise((resolve) => {
      if (!this.currentDB) {
        resolve(0);
        return;
      }
      
      const transaction = this.currentDB.transaction(args.storeName, 'readonly');
      const store = transaction.objectStore(args.storeName);
      const request = store.count();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        resolve(0);
      };
    });
  }

  clearStore(args) {
    return new Promise((resolve) => {
      if (!this.currentDB) {
        resolve();
        return;
      }
      
      const transaction = this.currentDB.transaction(args.storeName, 'readwrite');
      const store = transaction.objectStore(args.storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        resolve();
      };
    });
  }

  // Data Operations
  storeData(args) {
    if (!this.currentDB) return Promise.resolve();
    
    return new Promise((resolve) => {
      const transaction = this.currentDB.transaction(args.storeName, 'readwrite');
      const store = transaction.objectStore(args.storeName);
      store.put(args.value, args.key);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  getData(args) {
    if (!this.currentDB) return Promise.resolve('');
    
    return new Promise((resolve) => {
      const transaction = this.currentDB.transaction(args.storeName, 'readonly');
      const store = transaction.objectStore(args.storeName);
      const request = store.get(args.key);
      
      request.onsuccess = () => {
        resolve(request.result != null ? request.result : '');
      };
      
      request.onerror = () => {
        resolve('');
      };
    });
  }
}

Scratch.extensions.register(new IndexedDBExtension());
