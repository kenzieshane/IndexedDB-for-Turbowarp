# **IndexedDB Extension for TurboWarp, Complete Persistent Storage Solution**  
*Warning: won't work well with Apple devices, since apple have a different storage limit policy for IndexedDB. Needs to be run unsandboxed!* 
---
## This extension allows your Scratch projects to **save, load, and manage structured data** using **IndexedDB**, a browser-based NoSQL database. Perfect for:  

- **Game saves** (high scores, player progress)  
- **User preferences** (settings, themes)  
- **Offline data storage** (notes, lists, app data)  
---
# Installation

download the extension on this github release page, then go to turbowarp and open your project, add extension, custom extensions, add by files, then import the extension that you've just downloaded. 

## 💾 **Storage Advantages vs localStorage**  
| Feature | IndexedDB | localStorage |
|---------|-----------|--------------|
| **Capacity** | 50% of disk space (GBs possible) | 5-10MB max |
| **Data Types** | Objects, arrays, binary data | Only strings |
| **Performance** | Indexed (fast queries) | Linear scan |
| **Organization** | Multiple stores/tables | Single flat store |

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
