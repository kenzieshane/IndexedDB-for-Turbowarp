# **IndexedDB Extension for TurboWarp**  
**Complete Persistent Storage Solution**  

---

## 📖 **Quick Documentation**  

### 🔹 **1. Setup & Initialization**  
| Block | Description | Example |
|--------|-------------|---------|
| **`initialize persistent storage`** | Prepares database (run once at start) | `when green flag clicked`<br>`initialize persistent storage :: extension` |

---

### 🔹 **2. Saving & Loading Data**  
| Block | Description | Example |
|--------|-------------|---------|
| **`save in [store] key [key] value [value]`** | Stores any data (JSON recommended) | `save in "game" key "player1" value "{\"score\":100}"` |
| **`load from [store] key [key]`** (reporter) | Retrieves saved data | `set [data] to (load from "game" key "player1")` |

---

### 🔹 **3. Key Management**  
| Block | Description | Example |
|--------|-------------|---------|
| **`delete from [store] key [key]`** | Removes specific data | `delete from "game" key "tempScore"` |
| **`list all keys in [store]`** (reporter) | Returns all keys as JSON array | `set [keys] to (list all keys in "game")` |
| **`clear all data`** | Wipes entire database | `when [r v] key pressed`<br>`clear all data` |

---

## 💾 **Storage Advantages vs localStorage**  
| Feature | IndexedDB | localStorage |
|---------|-----------|--------------|
| **Capacity** | 50% of disk space (GBs possible) | 5-10MB max |
| **Data Types** | Objects, arrays, binary data | Only strings |
| **Performance** | Indexed (fast queries) | Linear scan |
| **Organization** | Multiple stores/tables | Single flat store |

---

## 🚀 **Example: Game Save System**  
```scratch
when green flag clicked
initialize persistent storage :: extension

when [s v] key pressed
save in "saves" key "progress" value "{
  \"level\":5, 
  \"items\":[\"sword\",\"potion\"]
}" :: extension

when [l v] key pressed
set [save] to (load from "saves" key "progress" :: extension)
```

---

## 💡 **Pro Tips**  
1. **Use JSON** for complex data:  
   ```scratch
   save in "game" key "settings" value "{
     \"volume\":80,
     \"controls\":\"wasd\"
   }"
   ```
   
2. **Check key existence**:  
   ```scratch
   if <(list all keys in "saves" :: extension) contains ["progress"]> then
     load data :: extension
   end
   ```

3. **Default store name**: `"default"` (created automatically)

---

## 🌐 **Browser Support**  
Works in all modern browsers (Chrome, Firefox, Edge, Safari). Data persists across:  
✔️ Page refreshes  
✔️ Browser restarts  
✔️ Computer reboots  

*(Note: Private/Incognito mode may clear data)*  

---

Need more help? Try:  
- `F12 → Application → IndexedDB` (to debug)  
- Right-click blocks → "help" in TurboWarp  

Happy coding! 🎮💾
