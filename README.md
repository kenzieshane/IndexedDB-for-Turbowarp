# **IndexedDB Extension for TurboWarp**  
**A powerful database system for Scratch projects!**  

This extension allows your Scratch projects to **save, load, and manage structured data** using **IndexedDB**, a browser-based NoSQL database. Perfect for:  
✔️ **Game saves** (high scores, player progress)  
✔️ **User preferences** (settings, themes)  
✔️ **Offline data storage** (notes, lists, app data)  

---

## **📖 Quick Documentation**  

### **🔹 1. Database Management**  
| Block | Description | Example |
|--------|-------------|---------|
| **`open database [name] version [1]`** | Opens (or creates) a database | `open database "game_saves" version 1` |
| **`delete entire database [name]`** | Permanently deletes a database | `delete entire database "old_data"` |
| **`list all databases`** (reporter) | Lists all available databases | `set [dbs] to (list all databases)` |

---

### **🔹 2. Store (Table) Management**  
| Block | Description | Example |
|--------|-------------|---------|
| **`create store [name] with options [options]`** | Creates a new store (table) | `create store "players" with options "keyPath: 'id'"` |
| **`delete store [name]`** | Deletes a store | `delete store "temp_data"` |
| **`list all stores in current database`** (reporter) | Lists all stores | `set [stores] to (list all stores)` |
| **`clear ALL records in [store]`** | Removes all data (keeps store) | `clear ALL records in "highscores"` |
| **`count records in [store]`** (reporter) | Returns number of records | `set [count] to (count records in "items")` |

---

### **🔹 3. Data Operations**  
| Block | Description | Example |
|--------|-------------|---------|
| **`store in [store] key [key] value [value]`** | Saves data | `store in "settings" key "volume" value "80"` |
| **`get from [store] key [key]`** (reporter) | Retrieves data | `set [volume] to (get from "settings" key "volume")` |

---

## **🚀 Example Project: Save & Load Game Data**  

### **1. Setup Database**  
```scratch
when green flag clicked
open database "game_saves" version 1
wait until <not <(current database) = [null]>> // Wait for DB to load
```

### **2. Save Player Progress**  
```scratch
when [s v] key pressed
store in "players" key "level" value (current level)
store in "players" key "score" value (score)
```

### **3. Load Player Progress**  
```scratch
when [l v] key pressed
set [current level] to (get from "players" key "level")
set [score] to (get from "players" key "score")
```

### **4. Clear Data (Reset Game)**  
```scratch
when [r v] key pressed
clear ALL records in "players"
```

---

## **⚠️ Important Notes**  
- **Data is saved per browser & domain** (different browsers won’t share data).  
- **Storage limits vary** (usually **50% of disk space**, but check browser policies).  
- **Works offline** (great for PWAs!).  

---

## **🔧 Need More Help?**  
- **Try the blocks in TurboWarp** (load the extension via URL).  
- **Check browser console** (`F12` → Console) for errors.  

