import { useEffect, useRef } from 'react'
import { useQuests } from './useQuests'

interface QuestEvent {
  type: 'game_start' | 'game_end' | 'score_achieved' | 'high_score' | 'cosmetic_purchased'
  data: any
  timestamp: number
}

export const useQuestEventListener = () => {
  const { updateQuestProgress, quests } = useQuests()
  const lastProcessedEvent = useRef<string | null>(null)

  useEffect(() => {
    console.log('🔍 Quest Event Listener: Starting localStorage monitoring')
    
    const checkForQuestEvents = () => {
      try {
        const latestEventStr = localStorage.getItem('latestQuestEvent')
        if (!latestEventStr) return

        const latestEvent: QuestEvent = JSON.parse(latestEventStr)
        const eventKey = `${latestEvent.type}-${latestEvent.timestamp}`
        
        // Skip if we already processed this event
        if (lastProcessedEvent.current === eventKey) return
        
        console.log('🎯 Quest Event Listener: New quest event detected:', latestEvent)
        lastProcessedEvent.current = eventKey
        
        // Process the quest event
        switch (latestEvent.type) {
          case 'game_start':
            console.log('🎮 Quest Event Listener: Processing game_start')
            updateQuestProgress('daily_play_1', 1)
            updateQuestProgress('daily_play_3', 1)
            updateQuestProgress('weekly_play_20', 1)
            updateQuestProgress('achievement_play_50', 1)
            break

          case 'score_achieved':
            const score = latestEvent.data.score
            console.log('🎯 Quest Event Listener: Processing score_achieved, score:', score)
            
            if (score >= 5) {
              updateQuestProgress('daily_score_5', score)
            }
            if (score >= 20) {
              updateQuestProgress('achievement_score_20', score)
            }
            updateQuestProgress('weekly_score_50', score)
            break

          case 'game_end':
            const finalScore = latestEvent.data.score
            console.log('🎯 Quest Event Listener: Processing game_end, score:', finalScore)
            
            // Check for high score achievement
            const currentHighScore = localStorage.getItem('highScore') || '0'
            if (finalScore > parseInt(currentHighScore)) {
              updateQuestProgress('daily_high_score', 1)
              updateQuestProgress('achievement_first_win', 1)
            }
            
            // Update total games played
            const totalGames = parseInt(localStorage.getItem('totalGames') || '0') + 1
            localStorage.setItem('totalGames', totalGames.toString())
            updateQuestProgress('achievement_play_50', totalGames)
            break

          case 'cosmetic_purchased':
            console.log('🎯 Quest Event Listener: Processing cosmetic_purchased')
            updateQuestProgress('weekly_cosmetic', 1)
            break

          default:
            console.log('🎯 Quest Event Listener: Unknown quest event type:', latestEvent.type)
        }
        
        console.log('🎯 Quest Event Listener: Quest event processed successfully')
        
      } catch (error) {
        console.error('🎯 Quest Event Listener: Error processing quest event:', error)
      }
    }

    // Check for quest events every 100ms
    const interval = setInterval(checkForQuestEvents, 100)
    
    console.log('🔍 Quest Event Listener: localStorage monitoring started')
    
    return () => {
      clearInterval(interval)
      console.log('🔍 Quest Event Listener: localStorage monitoring stopped')
    }
  }, [updateQuestProgress, quests])

  return {
    quests
  }
}
