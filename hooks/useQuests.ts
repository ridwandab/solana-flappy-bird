import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export interface Quest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'achievement'
  reward: number // SOL amount
  progress: number
  target: number
  completed: boolean
  claimed: boolean
  accepted: boolean // Quest must be accepted before progress can be tracked
  icon: string
  category: string
  lastUpdated: string
}

export const useQuests = () => {
  const { publicKey } = useWallet()
  const [quests, setQuests] = useState<Quest[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (publicKey) {
      loadQuests()
    }
  }, [publicKey])

  const loadQuests = () => {
    if (!publicKey) return

    try {
      // Load quests from localStorage
      const savedQuests = localStorage.getItem(`quests_${publicKey.toString()}`)
      if (savedQuests) {
        const parsedQuests = JSON.parse(savedQuests)
        setQuests(parsedQuests)
      } else {
        // Initialize with default quests
        initializeDefaultQuests()
      }
    } catch (error) {
      console.error('Failed to load quests:', error)
      initializeDefaultQuests()
    }
  }

  const initializeDefaultQuests = () => {
    const defaultQuests: Quest[] = [
      // Daily Quests
      {
        id: 'daily_play_1',
        title: 'First Flight',
        description: 'Play your first game today',
        type: 'daily',
        reward: 0.001,
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '🎮',
        category: 'gameplay',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'daily_score_10',
        title: 'Score Master',
        description: 'Score 10 points in a single game',
        type: 'daily',
        reward: 0.002,
        progress: 0,
        target: 10,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '🎯',
        category: 'gameplay',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'daily_play_3',
        title: 'Triple Play',
        description: 'Play 3 games today',
        type: 'daily',
        reward: 0.003,
        progress: 0,
        target: 3,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '🔄',
        category: 'gameplay',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'daily_high_score',
        title: 'Personal Best',
        description: 'Beat your high score',
        type: 'daily',
        reward: 0.005,
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '🏆',
        category: 'achievement',
        lastUpdated: new Date().toISOString()
      },

      // Weekly Quests
      {
        id: 'weekly_play_20',
        title: 'Weekly Warrior',
        description: 'Play 20 games this week',
        type: 'weekly',
        reward: 0.01,
        progress: 0,
        target: 20,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '⚔️',
        category: 'gameplay',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'weekly_score_100',
        title: 'Century Club',
        description: 'Score 100 points total this week',
        type: 'weekly',
        reward: 0.015,
        progress: 0,
        target: 100,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '💯',
        category: 'gameplay',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'weekly_cosmetic',
        title: 'Fashionista',
        description: 'Purchase a cosmetic item',
        type: 'weekly',
        reward: 0.02,
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '👗',
        category: 'cosmetic',
        lastUpdated: new Date().toISOString()
      },

      // Achievement Quests
      {
        id: 'achievement_first_win',
        title: 'First Victory',
        description: 'Win your first game',
        type: 'achievement',
        reward: 0.005,
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '🥇',
        category: 'achievement',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'achievement_score_50',
        title: 'Half Century',
        description: 'Score 50 points in a single game',
        type: 'achievement',
        reward: 0.01,
        progress: 0,
        target: 50,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '🎖️',
        category: 'achievement',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'achievement_play_100',
        title: 'Centurion',
        description: 'Play 100 games total',
        type: 'achievement',
        reward: 0.05,
        progress: 0,
        target: 100,
        completed: false,
        claimed: false,
        accepted: false,
        icon: '🏅',
        category: 'achievement',
        lastUpdated: new Date().toISOString()
      }
    ]

    setQuests(defaultQuests)
    saveQuests(defaultQuests)
  }

  const saveQuests = (questsToSave: Quest[]) => {
    if (!publicKey) return

    try {
      localStorage.setItem(`quests_${publicKey.toString()}`, JSON.stringify(questsToSave))
    } catch (error) {
      console.error('Failed to save quests:', error)
    }
  }

  const acceptQuest = (questId: string) => {
    console.log(`Accepting quest: ${questId}`)
    
    setQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.id === questId && !quest.accepted) {
          console.log(`Quest ${questId} accepted!`)
          return {
            ...quest,
            accepted: true,
            lastUpdated: new Date().toISOString()
          }
        }
        return quest
      })
      
      saveQuests(updated)
      return updated
    })
  }

  const updateQuestProgress = (questId: string, increment: number) => {
    console.log(`Updating quest progress: ${questId}, increment: ${increment}`)
    
    setQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.id === questId && quest.accepted) { // Only update if quest is accepted
          const newProgress = quest.progress + increment
          const completed = newProgress >= quest.target && !quest.completed
          
          console.log(`Quest ${questId}: ${quest.progress} + ${increment} = ${newProgress} (target: ${quest.target}, completed: ${completed})`)
          
          return {
            ...quest,
            progress: Math.min(newProgress, quest.target),
            completed: completed || quest.completed,
            lastUpdated: new Date().toISOString()
          }
        } else if (quest.id === questId && !quest.accepted) {
          console.log(`Quest ${questId} not accepted yet, skipping progress update`)
        }
        return quest
      })
      
      saveQuests(updated)
      return updated
    })
  }

  const claimQuestReward = async (questId: string) => {
    if (!publicKey) return

    setQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.id === questId && quest.completed && !quest.claimed) {
          return {
            ...quest,
            claimed: true,
            lastUpdated: new Date().toISOString()
          }
        }
        return quest
      })
      
      saveQuests(updated)
      return updated
    })
  }

  const resetDailyQuests = () => {
    const today = new Date().toDateString()
    const lastReset = localStorage.getItem('lastDailyReset')
    
    if (lastReset !== today) {
      setQuests(prev => {
        const updated = prev.map(quest => {
          if (quest.type === 'daily') {
            return {
              ...quest,
              progress: 0,
              completed: false,
              claimed: false,
              accepted: false,
              lastUpdated: new Date().toISOString()
            }
          }
          return quest
        })
        
        saveQuests(updated)
        localStorage.setItem('lastDailyReset', today)
        return updated
      })
    }
  }

  const resetWeeklyQuests = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekKey = startOfWeek.toDateString()
    const lastReset = localStorage.getItem('lastWeeklyReset')
    
    if (lastReset !== weekKey) {
      setQuests(prev => {
        const updated = prev.map(quest => {
          if (quest.type === 'weekly') {
            return {
              ...quest,
              progress: 0,
              completed: false,
              claimed: false,
              accepted: false,
              lastUpdated: new Date().toISOString()
            }
          }
          return quest
        })
        
        saveQuests(updated)
        localStorage.setItem('lastWeeklyReset', weekKey)
        return updated
      })
    }
  }

  const getQuestStats = () => {
    const completed = quests.filter(q => q.completed).length
    const claimed = quests.filter(q => q.claimed).length
    const totalReward = quests.filter(q => q.claimed).reduce((sum, q) => sum + q.reward, 0)
    const availableReward = quests.filter(q => q.completed && !q.claimed).reduce((sum, q) => sum + q.reward, 0)

    return {
      total: quests.length,
      completed,
      claimed,
      totalReward,
      availableReward
    }
  }

  const getQuestsByCategory = (category: string) => {
    if (category === 'all') return quests
    return quests.filter(quest => quest.category === category)
  }

  const getQuestsByType = (type: string) => {
    return quests.filter(quest => quest.type === type)
  }

  // Auto-reset daily and weekly quests
  useEffect(() => {
    resetDailyQuests()
    resetWeeklyQuests()
  }, [])

  return {
    quests,
    isLoading,
    acceptQuest,
    updateQuestProgress,
    claimQuestReward,
    getQuestStats,
    getQuestsByCategory,
    getQuestsByType,
    loadQuests
  }
}
