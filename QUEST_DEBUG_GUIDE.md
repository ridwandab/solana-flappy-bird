# Quest Debug Guide - Troubleshooting Quest Progress

## 🔍 **Quest Progress Debug - TROUBLESHOOTING GUIDE!**

Guide untuk debugging mengapa quest progress tidak naik meskipun sudah bermain game!

## ✅ **Debug Steps yang Sudah Ditambahkan:**

### **1. GameScene Event Emission Debug**
- ✅ **Game Start Logging**: `🎮 Game started - emitting game_start quest event`
- ✅ **Quest Event Logging**: `🎯 Emitting quest event: ${type}`
- ✅ **Event Success Logging**: `🎯 Quest event emitted successfully: ${type}`

### **2. useQuestIntegration Hook Debug**
- ✅ **Hook Trigger Logging**: `🔍 useQuestIntegration useEffect triggered, game:`
- ✅ **Game Instance Logging**: `Quest integration: Setting up quest event listeners for game:`
- ✅ **Event Listener Setup**: `🔍 Setting up quest event listener on game.events:`
- ✅ **Event Listener Success**: `Quest integration: Event listener attached successfully`

### **3. Game Component Debug**
- ✅ **Quest Integration Debug**: `🔍 Quest integration debug - game instance:`
- ✅ **Quests State Debug**: `🔍 Quest integration debug - quests:`
- ✅ **Quest Event Reception**: `Quest event received in Game component:`

## 🎯 **Debug Checklist - Periksa Console Browser:**

### **1. Game Start Debug**
```
✅ Harus muncul di console:
🎮 Game started - emitting game_start quest event
🎯 Emitting quest event: game_start
🎯 Quest event emitted successfully: game_start
```

### **2. Quest Integration Debug**
```
✅ Harus muncul di console:
🔍 useQuestIntegration useEffect triggered, game: [Game Object]
Quest integration: Setting up quest event listeners for game: [Game Object]
🔍 Setting up quest event listener on game.events: [EventEmitter]
Quest integration: Event listener attached successfully
```

### **3. Quest Event Reception Debug**
```
✅ Harus muncul di console:
Quest event received in Game component: {type: "game_start", data: {...}}
Quest event received in integration: {type: "game_start", data: {...}}
Processing game_start quest event
```

### **4. Quest Progress Update Debug**
```
✅ Harus muncul di console:
Updating quest progress: daily_play_1, increment: 1
Quest daily_play_1: 0 + 1 = 1 (target: 1, completed: true)
```

## 🔧 **Troubleshooting Steps:**

### **1. Jika Game Start Events Tidak Muncul**
- ✅ **Problem**: Game start events tidak ter-emit
- ✅ **Check**: Apakah player menekan START button?
- ✅ **Solution**: Pastikan startGame() method dipanggil

### **2. Jika Quest Integration Tidak Ter-setup**
- ✅ **Problem**: useQuestIntegration hook tidak ter-panggil
- ✅ **Check**: Apakah game instance tersedia saat hook dipanggil?
- ✅ **Solution**: Pastikan game instance tersedia sebelum hook dipanggil

### **3. Jika Event Listener Tidak Ter-pasang**
- ✅ **Problem**: Event listener tidak ter-pasang
- ✅ **Check**: Apakah game.events tersedia?
- ✅ **Solution**: Pastikan game instance memiliki events property

### **4. Jika Quest Events Tidak Ter-receive**
- ✅ **Problem**: Quest events tidak ter-receive di integration
- ✅ **Check**: Apakah event listener ter-pasang dengan benar?
- ✅ **Solution**: Pastikan event listener ter-pasang sebelum events ter-emit

### **5. Jika Quest Progress Tidak Ter-update**
- ✅ **Problem**: Quest progress tidak ter-update
- ✅ **Check**: Apakah updateQuestProgress dipanggil?
- ✅ **Solution**: Pastikan quest progress update logic bekerja

## 🎮 **Debug Flow - Step by Step:**

### **1. Game Start Flow**
```
1. Player clicks START button
2. startGame() method called
3. 🎮 Game started - emitting game_start quest event
4. emitQuestEvent('game_start') called
5. 🎯 Emitting quest event: game_start
6. 🎯 Quest event emitted successfully: game_start
```

### **2. Quest Integration Flow**
```
1. useQuestIntegration hook called
2. 🔍 useQuestIntegration useEffect triggered, game: [Game Object]
3. Quest integration: Setting up quest event listeners for game: [Game Object]
4. 🔍 Setting up quest event listener on game.events: [EventEmitter]
5. Quest integration: Event listener attached successfully
```

### **3. Event Reception Flow**
```
1. Quest event emitted from GameScene
2. Quest event received in Game component: {type: "game_start", data: {...}}
3. Quest event received in integration: {type: "game_start", data: {...}}
4. Processing game_start quest event
5. updateQuestProgress('daily_play_1', 1) called
```

### **4. Progress Update Flow**
```
1. updateQuestProgress called
2. Updating quest progress: daily_play_1, increment: 1
3. Quest daily_play_1: 0 + 1 = 1 (target: 1, completed: true)
4. Quest progress updated in state
5. Quest progress saved to localStorage
```

## 🚀 **Debug Commands - Console Browser:**

### **1. Check Game Instance**
```javascript
// Di console browser, cek apakah game instance tersedia
console.log('Game instance:', window.phaserGame)
```

### **2. Check Quest Events**
```javascript
// Di console browser, cek apakah quest events ter-emit
// Harus muncul saat bermain game
```

### **3. Check Quest Progress**
```javascript
// Di console browser, cek quest progress di localStorage
const quests = localStorage.getItem('quests_anonymous')
console.log('Quests:', JSON.parse(quests))
```

### **4. Check Event Listeners**
```javascript
// Di console browser, cek apakah event listeners ter-pasang
// Harus muncul saat game dimulai
```

## 🎉 **Debug Guide - SIAP DIGUNAKAN!**

**Debug guide sudah siap untuk troubleshooting quest progress!**

- ✅ **Comprehensive Logging**: Semua quest events ter-log dengan jelas
- ✅ **Step-by-step Debug**: Debug flow yang jelas dan mudah diikuti
- ✅ **Troubleshooting Steps**: Langkah-langkah untuk mengatasi masalah
- ✅ **Console Commands**: Commands untuk debugging di console browser

**Sekarang silakan buka console browser dan bermain game untuk melihat debug logs!** 🎮🚀

**Jika masih ada masalah, silakan share console logs yang muncul!** ✅
