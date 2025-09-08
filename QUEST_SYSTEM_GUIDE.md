# Quest System Guide

## 🎯 **Quest System Overview**

Sistem quest yang lengkap dengan reward SOL gratis untuk meningkatkan engagement dan memberikan value kepada player!

## 🏆 **Quest Types**

### **1. Daily Quests**
- ✅ **Reset**: Setiap hari otomatis
- ✅ **Reward**: 0.001 - 0.005 SOL
- ✅ **Examples**: 
  - First Flight (Play 1 game)
  - Score Master (Score 10 points)
  - Triple Play (Play 3 games)
  - Personal Best (Beat high score)

### **2. Weekly Quests**
- ✅ **Reset**: Setiap minggu otomatis
- ✅ **Reward**: 0.01 - 0.02 SOL
- ✅ **Examples**:
  - Weekly Warrior (Play 20 games)
  - Century Club (Score 100 points total)
  - Fashionista (Purchase cosmetic)

### **3. Achievement Quests**
- ✅ **Reset**: Tidak pernah reset (one-time)
- ✅ **Reward**: 0.005 - 0.05 SOL
- ✅ **Examples**:
  - First Victory (Win first game)
  - Half Century (Score 50 points)
  - Centurion (Play 100 games total)

## 🎮 **Quest Categories**

### **Gameplay Quests**
- 🎮 **First Flight**: Play your first game today
- 🎯 **Score Master**: Score 10 points in a single game
- 🔄 **Triple Play**: Play 3 games today
- ⚔️ **Weekly Warrior**: Play 20 games this week
- 💯 **Century Club**: Score 100 points total this week

### **Achievement Quests**
- 🏆 **Personal Best**: Beat your high score
- 🥇 **First Victory**: Win your first game
- 🎖️ **Half Century**: Score 50 points in a single game
- 🏅 **Centurion**: Play 100 games total

### **Cosmetic Quests**
- 👗 **Fashionista**: Purchase a cosmetic item

## 💰 **Reward System**

### **Reward Amounts**
```typescript
// Daily Quests
'First Flight': 0.001 SOL
'Score Master': 0.002 SOL
'Triple Play': 0.003 SOL
'Personal Best': 0.005 SOL

// Weekly Quests
'Weekly Warrior': 0.01 SOL
'Century Club': 0.015 SOL
'Fashionista': 0.02 SOL

// Achievement Quests
'First Victory': 0.005 SOL
'Half Century': 0.01 SOL
'Centurion': 0.05 SOL
```

### **Claiming Rewards**
1. **Complete Quest**: Achieve the required target
2. **Click Claim**: Click "Claim Reward" button
3. **Receive SOL**: SOL automatically sent to wallet
4. **Mark Complete**: Quest marked as completed

## 🔧 **Technical Implementation**

### **Quest State Management**
```typescript
// useQuests Hook
const {
  quests,
  updateQuestProgress,
  claimQuestReward,
  getQuestStats,
  getQuestsByCategory
} = useQuests()
```

### **Quest Progress Tracking**
```typescript
// Game Events Integration
this.emitQuestEvent('game_start', { timestamp: Date.now() })
this.emitQuestEvent('score_achieved', { score: this.score })
this.emitQuestEvent('game_end', { score: this.score, pipesPassed: this.pipesPassed })
```

### **Auto Reset System**
```typescript
// Daily Reset
const resetDailyQuests = () => {
  const today = new Date().toDateString()
  const lastReset = localStorage.getItem('lastDailyReset')
  
  if (lastReset !== today) {
    // Reset all daily quests
  }
}

// Weekly Reset
const resetWeeklyQuests = () => {
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekKey = startOfWeek.toDateString()
  // Reset all weekly quests
}
```

## 🎯 **Quest UI Components**

### **1. QuestSystem.tsx**
- ✅ **Main Quest Interface**: Browse and claim quests
- ✅ **Category Filtering**: Filter by type (All, Gameplay, Achievement, Cosmetic)
- ✅ **Progress Tracking**: Visual progress bars
- ✅ **Reward Display**: SOL amount and claim buttons

### **2. QuestRewardSystem.tsx**
- ✅ **Reward Modal**: Popup for claiming rewards
- ✅ **Progress Tracker**: Floating quest tracker button
- ✅ **Success Animation**: Celebration when reward claimed

### **3. QuestProgressTracker.tsx**
- ✅ **Floating Button**: Always visible quest progress
- ✅ **Quick Stats**: Completed quests and available rewards
- ✅ **Notification Badge**: Shows number of available rewards

## 🚀 **Integration with Game**

### **Game Events**
```typescript
// GameScene.ts Integration
private emitQuestEvent(type: QuestEvent['type'], data: any) {
  this.events.emit('questEvent', { type, data })
}

// Quest Event Types
interface QuestEvent {
  type: 'game_start' | 'game_end' | 'score_achieved' | 'high_score' | 'cosmetic_purchased'
  data: any
}
```

### **Progress Updates**
```typescript
// Update quest progress based on game events
updateQuestProgress('daily_play_1', 1) // Game started
updateQuestProgress('daily_score_10', currentScore) // Score achieved
updateQuestProgress('weekly_play_20', gamesPlayedThisWeek) // Games played
```

## 📊 **Quest Statistics**

### **Player Stats**
- ✅ **Total Quests**: Number of available quests
- ✅ **Completed**: Number of completed quests
- ✅ **SOL Earned**: Total SOL earned from quests
- ✅ **Available Rewards**: SOL available to claim

### **Quest Analytics**
- ✅ **Completion Rate**: Percentage of quests completed
- ✅ **Popular Quests**: Most completed quest types
- ✅ **Reward Distribution**: SOL distribution across quest types

## 🎮 **User Experience**

### **Quest Discovery**
1. **Main Menu**: Quest button prominently displayed
2. **Quest Tracker**: Floating button shows available rewards
3. **Progress Updates**: Real-time progress updates during gameplay
4. **Reward Notifications**: Popup when quest completed

### **Reward Flow**
1. **Play Game**: Quest progress updates automatically
2. **Complete Quest**: Progress bar reaches 100%
3. **Claim Reward**: Click claim button
4. **Receive SOL**: SOL sent to wallet
5. **Celebration**: Success animation and notification

## 🔄 **Quest Lifecycle**

### **Daily Quest Cycle**
```
Day 1: Quest Available → Player Progress → Quest Complete → Reward Claimed
Day 2: Quest Reset → Available Again → Player Progress → ...
```

### **Weekly Quest Cycle**
```
Week 1: Quest Available → Player Progress → Quest Complete → Reward Claimed
Week 2: Quest Reset → Available Again → Player Progress → ...
```

### **Achievement Quest Cycle**
```
One-time: Quest Available → Player Progress → Quest Complete → Reward Claimed → Never Reset
```

## 🎯 **Benefits**

### **For Players**
- ✅ **Free SOL**: Earn SOL without spending money
- ✅ **Engagement**: Daily and weekly goals to keep playing
- ✅ **Progression**: Clear goals and rewards
- ✅ **Variety**: Different types of quests for different play styles

### **For Game**
- ✅ **Retention**: Daily and weekly quests increase retention
- ✅ **Engagement**: Players have clear goals and rewards
- ✅ **Monetization**: Players earn SOL to spend in store
- ✅ **Community**: Leaderboard and achievement system

## 🚀 **Future Enhancements**

### **Planned Features**
- ✅ **Seasonal Quests**: Special quests for holidays/events
- ✅ **Guild Quests**: Team-based quests for groups
- ✅ **NFT Rewards**: Special cosmetic items as quest rewards
- ✅ **Social Quests**: Share game achievements on social media

### **Advanced Features**
- ✅ **Quest Chains**: Sequential quests with storylines
- ✅ **Dynamic Rewards**: Rewards that change based on player level
- ✅ **Cross-Game Quests**: Quests that span multiple games
- ✅ **Community Goals**: Server-wide quest objectives

## 📋 **Setup Instructions**

### **1. Install Quest System**
```bash
# Quest components are already created
# No additional installation required
```

### **2. Integrate with Game**
```typescript
// Add quest event listeners in Game.tsx
game.events.on('questEvent', (event) => {
  // Handle quest events
  updateQuestProgress(event.type, event.data)
})
```

### **3. Add to Main Menu**
```typescript
// MainMenu.tsx already includes quest button
<button onClick={onOpenQuests}>
  <Trophy className="w-12 h-12" />
  <span>Quests</span>
</button>
```

## 🎉 **Ready to Use!**

Quest system sudah siap digunakan! Player dapat:
- ✅ **Browse Quests**: Lihat semua quest yang tersedia
- ✅ **Track Progress**: Monitor progress real-time
- ✅ **Claim Rewards**: Dapatkan SOL gratis
- ✅ **Compete**: Bersaing dengan player lain

Sistem quest ini akan meningkatkan engagement dan memberikan value kepada player dengan reward SOL gratis! 🎮💰
