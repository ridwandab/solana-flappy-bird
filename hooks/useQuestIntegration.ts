import { useEffect } from 'react'
import { useQuests } from './useQuests'

interface QuestEvent {
  type: 'game_start' | 'game_end' | 'score_achieved' | 'high_score' | 'cosmetic_purchased'
  data: any
}

export const useQuestIntegration = (game: any) => {
  const { acceptQuest, updateQuestProgress, quests } = useQuests()

  useEffect(() => {
    console.log('🔍 useQuestIntegration useEffect triggered, game:', game)
    if (!game) {
      console.log('Quest integration: No game instance available - this is normal on first render')
      return
    }

    console.log('Quest integration: Setting up quest event listeners for game:', game)
    console.log('Quest integration: Game events object:', game.events)

    const handleQuestEvent = (event: QuestEvent) => {
      console.log('🎯 Quest event received in integration:', event)
      
      switch (event.type) {
        case 'game_start':
          console.log('🎮 Processing game_start quest event')
          // Auto-accept and update daily play quests
          console.log('🎮 Auto-accepting quests...')
          acceptQuest('daily_play_1')
          acceptQuest('daily_play_3')
          acceptQuest('weekly_play_20')
          acceptQuest('achievement_play_50')
          
          // Update daily play quests
          console.log('🎮 Updating quest progress...')
          updateQuestProgress('daily_play_1', 1)
          updateQuestProgress('daily_play_3', 1)
          updateQuestProgress('weekly_play_20', 1)
          updateQuestProgress('achievement_play_50', 1)
          console.log('🎮 Game start quest processing completed')
          break

        case 'score_achieved':
          const score = event.data.score
          console.log('🎯 Processing score_achieved quest event, score:', score)
          
          // Auto-accept score-based quests
          console.log('🎯 Auto-accepting score quests...')
          acceptQuest('daily_score_5')
          acceptQuest('achievement_score_20')
          acceptQuest('weekly_score_50')
          
          // Update score-based quests
          console.log('🎯 Updating score quest progress...')
          if (score >= 5) {
            console.log('🎯 Updating daily_score_5 quest with score:', score)
            updateQuestProgress('daily_score_5', score)
          }
          if (score >= 20) {
            console.log('🎯 Updating achievement_score_20 quest with score:', score)
            updateQuestProgress('achievement_score_20', score)
          }
          
          // Update weekly score quest
          console.log('🎯 Updating weekly_score_50 quest with score:', score)
          updateQuestProgress('weekly_score_50', score)
          console.log('🎯 Score achieved quest processing completed')
          break

        case 'game_end':
          const finalScore = event.data.score
          const pipesPassed = event.data.pipesPassed || 0
          console.log('Processing game_end quest event, score:', finalScore)
          
          // Auto-accept achievement quests
          acceptQuest('daily_high_score')
          acceptQuest('achievement_first_win')
          
          // Check for high score achievement
          const currentHighScore = localStorage.getItem('highScore') || '0'
          if (finalScore > parseInt(currentHighScore)) {
            updateQuestProgress('daily_high_score', 1)
            updateQuestProgress('achievement_first_win', 1)
            localStorage.setItem('highScore', finalScore.toString())
          }
          
          // Update total games played
          const totalGames = parseInt(localStorage.getItem('totalGames') || '0') + 1
          localStorage.setItem('totalGames', totalGames.toString())
          
          // Update achievement quest for total games
          updateQuestProgress('achievement_play_50', totalGames)
          break

        case 'cosmetic_purchased':
          console.log('Processing cosmetic_purchased quest event')
          // Auto-accept cosmetic quest
          acceptQuest('weekly_cosmetic')
          updateQuestProgress('weekly_cosmetic', 1)
          break

        default:
          console.log('Unknown quest event type:', event.type)
      }
    }

    // Listen for quest events from game
    console.log('🔍 Setting up quest event listener on game.events:', game.events)
    game.events.on('questEvent', handleQuestEvent)
    console.log('Quest integration: Event listener attached successfully')

    return () => {
      if (game && game.events) {
        game.events.off('questEvent', handleQuestEvent)
        console.log('Quest integration: Event listener removed')
      }
    }
  }, [game])

  return {
    quests,
    acceptQuest,
    updateQuestProgress
  }
}

