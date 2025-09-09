'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Gamepad2,
  Palette,
  Info,
  Shield,
  Bell,
  Globe,
  RotateCcw,
  Save,
  Check,
  X
} from 'lucide-react'
import { useSettings, GameSettings } from '@/hooks/useSettings'

interface SettingsProps {
  onBackToMenu: () => void
}

export const Settings: FC<SettingsProps> = ({ onBackToMenu }) => {
  const { publicKey } = useWallet()
  const { 
    settings, 
    setSettings,
    isLoading, 
    saveSettings, 
    updateSetting, 
    resetSettings 
  } = useSettings()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSettingChange = async (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setHasUnsavedChanges(true)
    setSaveStatus('idle')
  }

  const handleSaveSettings = async () => {
    setSaveStatus('saving')
    const success = await saveSettings(settings)
    if (success) {
      setSaveStatus('saved')
      setHasUnsavedChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const success = await resetSettings()
      if (success) {
        setHasUnsavedChanges(false)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full max-h-screen ui-scroll pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
              <SettingsIcon className="w-10 h-10 text-blue-400" />
              <span>Settings</span>
            </h1>
            <p className="text-white/60 mt-2">
              Customize your gaming experience
            </p>
          </div>
          
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>← Back to Menu</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audio Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Volume2 className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Audio Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Sound Effects</h3>
                  <p className="text-white/60 text-sm">Game sound effects</p>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Sound Volume */}
              {settings.soundEnabled && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Sound Volume</span>
                    <span className="text-white/60">{settings.soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Graphics Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Monitor className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Graphics Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Graphics Quality */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Graphics Quality</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((quality) => (
                    <button
                      key={quality}
                      onClick={() => handleSettingChange('graphicsQuality', quality)}
                      className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                        settings.graphicsQuality === quality
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show FPS */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Show FPS</h3>
                  <p className="text-white/60 text-sm">Display frames per second</p>
                </div>
                <button
                  onClick={() => handleSettingChange('showFPS', !settings.showFPS)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showFPS ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showFPS ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Game Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Auto Save</h3>
                  <p className="text-white/60 text-sm">Automatically save progress</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoSave ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <p className="text-white/60 text-sm">Quest and achievement notifications</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.notifications ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Language */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Language</h3>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account & Privacy */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Account & Privacy</h2>
            </div>
            
            <div className="space-y-6">
              {/* Wallet Info */}
              {publicKey ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 font-semibold">Wallet Connected</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 font-semibold">Wallet Not Connected</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Connect your wallet to access all features
                  </p>
                </div>
              )}

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Show on Leaderboard</span>
                    <button 
                      onClick={() => handleSettingChange('showOnLeaderboard', !settings.showOnLeaderboard)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.showOnLeaderboard ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.showOnLeaderboard ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Allow Friend Requests</span>
                    <button 
                      onClick={() => handleSettingChange('allowFriendRequests', !settings.allowFriendRequests)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.allowFriendRequests ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.allowFriendRequests ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Settings Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading || saveStatus === 'saving'}
            className={`px-8 py-3 rounded-lg transition-colors font-semibold flex items-center space-x-2 ${
              saveStatus === 'saved' 
                ? 'bg-green-500 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : hasUnsavedChanges
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <X className="w-4 h-4" />
                <span>Error!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleResetSettings}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/40 text-sm">
          <p>Settings are saved locally in your browser</p>
        </div>
      </div>
    </div>
  )
}

