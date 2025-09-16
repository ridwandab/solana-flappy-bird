'use client'

import React from 'react'
import { Instagram, Facebook, Twitter, Youtube, ExternalLink } from 'lucide-react'

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/ridwanxsaputra/',
    icon: Instagram,
    color: 'from-pink-500 to-purple-600',
    hoverColor: 'hover:from-pink-600 hover:to-purple-700'
  },
  {
    name: 'Facebook',
    url: 'https://web.facebook.com/yk.redmen/?locale=id_ID',
    icon: Facebook,
    color: 'from-blue-600 to-blue-700',
    hoverColor: 'hover:from-blue-700 hover:to-blue-800'
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com/xwordap',
    icon: Twitter,
    color: 'from-gray-800 to-gray-900',
    hoverColor: 'hover:from-gray-700 hover:to-gray-800'
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@officialrkfamilia7511',
    icon: Youtube,
    color: 'from-red-500 to-red-600',
    hoverColor: 'hover:from-red-600 hover:to-red-700'
  }
]

export const SocialMediaLinks: React.FC = () => {
  const handleLinkClick = (url: string, name: string) => {
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer')
    console.log(`Opening ${name}: ${url}`)
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Follow Us</h3>
        <p className="text-white/60 text-sm">Stay connected with our latest updates</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SOCIAL_LINKS.map((social) => {
          const IconComponent = social.icon
          return (
            <button
              key={social.name}
              onClick={() => handleLinkClick(social.url, social.name)}
              className={`
                group relative overflow-hidden rounded-lg p-4 transition-all duration-300 
                bg-gradient-to-br ${social.color} ${social.hoverColor}
                hover:scale-105 hover:shadow-lg
                flex flex-col items-center justify-center
                min-h-[80px]
              `}
              title={`Visit our ${social.name}`}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <IconComponent className="w-6 h-6 text-white mb-2 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              
              {/* Platform name */}
              <span className="text-white text-xs font-medium relative z-10 group-hover:text-white/90 transition-colors duration-300">
                {social.name}
              </span>
              
              {/* External link indicator */}
              <ExternalLink className="w-3 h-3 text-white/60 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </button>
          )
        })}
      </div>
      
      {/* Additional info */}
      <div className="mt-4 text-center">
        <p className="text-white/40 text-xs">
          Click any platform to visit our official accounts
        </p>
      </div>
    </div>
  )
}
