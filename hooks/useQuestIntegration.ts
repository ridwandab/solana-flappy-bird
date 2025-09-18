import { useEffect } from 'react'
import { useQuests } from './useQuests'

interface QuestEvent {
  type: 'game_start' | 'game_end' | 'score_achieved' | 'high_score' | 'cosmetic_purchased'
  data: any
}

export const useQuestIntegration = (game: any) => {
  console.log('🔍🔍🔍 useQuestIntegration hook called with game:', game)
  console.log('🔍🔍🔍 useQuestIntegration hook called at:', new Date().toISOString())
  const { acceptQuest, updateQuestProgress, quests } = useQuests()
  console.log('🔍🔍🔍 useQuestIntegration hook quests loaded:', quests.length, 'quests')
  console.log('🔍🔍🔍 useQuestIntegration hook quests:', quests.map(q => ({ id: q.id, accepted: q.accepted, progress: q.progress })))

  useEffect(() => {
    console.log('🔍🔍🔍 useQuestIntegration useEffect triggered, game:', game)
    console.log('🔍🔍🔍 useQuestIntegration gameReady state:', game !== null)
    console.log('🔍🔍🔍 useQuestIntegration game type:', typeof game)
    console.log('🔍🔍🔍 useQuestIntegration game events:', game?.events)
    console.log('🔍🔍🔍 useQuestIntegration quests:', quests)
    console.log('🔍🔍🔍 useQuestIntegration useEffect triggered at:', new Date().toISOString())
    if (!game) {
      console.log('🔍🔍🔍 Quest integration: No game instance available - this is normal on first render')
      return
    }

    console.log('Quest integration: Setting up quest event listeners for game:', game)
    console.log('Quest integration: Game events object:', game.events)
    console.log('Quest integration: Game events methods:', Object.keys(game.events || {}))
    console.log('Quest integration: Game events listeners count:', game.events?.listeners?.('questEvent')?.length || 0)

    const handleQuestEvent = (event: QuestEvent) => {
      console.log('🎯 Quest event received in integration:', event)
      console.log('🎯 Quest event type:', event.type)
      console.log('🎯 Quest event data:', event.data)
      
      switch (event.type) {
        case 'game_start':
          console.log('🎮 Processing game_start quest event')
          // Only update quests that are already accepted
          console.log('🎮 Updating accepted quest progress...')
          updateQuestProgress('daily_play_1', 1)
          updateQuestProgress('daily_play_3', 1)
          updateQuestProgress('weekly_play_20', 1)
          updateQuestProgress('achievement_play_50', 1)
          console.log('🎮 Game start quest processing completed')
          break

        case 'score_achieved':
          const score = event.data.score
          console.log('🎯 Processing score_achieved quest event, score:', score)
          console.log('🎯 Score data:', event.data)
          
          // Only update score-based quests that are already accepted
          console.log('🎯 Updating accepted score quest progress...')
          console.log('🎯 Current quests:', quests.map(q => ({ id: q.id, accepted: q.accepted, progress: q.progress })))
          
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
          
          // Only update achievement quests that are already accepted
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
          // Only update cosmetic quest that is already accepted
          updateQuestProgress('weekly_cosmetic', 1)
          break

        default:
          console.log('Unknown quest event type:', event.type)
      }
    }

    // Listen for quest events from game
    console.log('🔍 Setting up quest event listener on game.events:', game.events)
    console.log('🔍 Game events on method:', typeof game.events.on)
    console.log('🔍 Game events emit method:', typeof game.events.emit)
    console.log('🔍 Game events listeners before:', game.events?.listeners?.('questEvent')?.length || 0)
    console.log('🔍 Setting up quest event listener at:', new Date().toISOString())
    
    if (game.events && typeof game.events.on === 'function') {
      game.events.on('questEvent', handleQuestEvent)
      console.log('Quest integration: Event listener attached successfully')
      console.log('🔍 Game events listeners after:', game.events?.listeners?.('questEvent')?.length || 0)
      console.log('🔍 Quest event listener attached at:', new Date().toISOString())
    } else {
      console.error('Quest integration: Game events.on is not available!')
      console.error('Quest integration: Game events object:', game.events)
      console.error('Quest integration: Game events type:', typeof game.events)
    }

    return () => {
      if (game && game.events) {
        game.events.off('questEvent', handleQuestEvent)
        console.log('Quest integration: Event listener removed')
      }
    }
  }, [game, quests])

  return {
    quests,
    acceptQuest,
    updateQuestProgress
  }
}

