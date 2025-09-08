'use client'

import { Play, Home } from 'lucide-react'

interface PauseModalProps {
  onResume: () => void
  onBackToMenu: () => void
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onBackToMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="space-y-6">
          {/* Pause Title */}
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white">PAUSED</h2>
            <p className="text-white/60">Game is paused</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={onResume}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              <Play size={20} />
              <span>Resume Game</span>
            </button>
            
            <button
              onClick={onBackToMenu}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Main Menu</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="text-white/60 text-sm">
            <p>Press ESC to pause/unpause</p>
          </div>
        </div>
      </div>
    </div>
  )
}
