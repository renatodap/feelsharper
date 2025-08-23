'use client';

import { useState } from 'react';

// Lightning Logo Component
const LightningLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Sample text for testing
const sampleTitle = "FEELSHARPER";
const sampleSubtitle = "Lightning-Fast Fitness Tracking";
const sampleText = "The first fitness tracker that speaks your language. No forms, no menus, no friction. Just talk naturally and let AI handle everything else. 95% accuracy in understanding your activities.";

// Font combinations to test
const fontCombinations = [
  {
    id: 1,
    titleFont: "'Russo One', sans-serif",
    textFont: "'Inter', sans-serif",
    name: "Russo One + Inter",
    description: "Bold & Modern"
  },
  {
    id: 2,
    titleFont: "'Orbitron', monospace",
    textFont: "'Space Grotesk', sans-serif",
    name: "Orbitron + Space Grotesk",
    description: "Futuristic & Clean"
  },
  {
    id: 3,
    titleFont: "'Bebas Neue', cursive",
    textFont: "'Roboto', sans-serif",
    name: "Bebas Neue + Roboto",
    description: "Impactful & Readable"
  },
  {
    id: 4,
    titleFont: "'Black Ops One', cursive",
    textFont: "'Open Sans', sans-serif",
    name: "Black Ops One + Open Sans",
    description: "Military & Professional"
  },
  {
    id: 5,
    titleFont: "'Teko', sans-serif",
    textFont: "'Lato', sans-serif",
    name: "Teko + Lato",
    description: "Tall & Friendly"
  },
  {
    id: 6,
    titleFont: "'Rajdhani', sans-serif",
    textFont: "'Work Sans', sans-serif",
    name: "Rajdhani + Work Sans",
    description: "Technical & Approachable"
  },
  {
    id: 7,
    titleFont: "'Audiowide', cursive",
    textFont: "'Source Sans Pro', sans-serif",
    name: "Audiowide + Source Sans",
    description: "Techy & Clear"
  },
  {
    id: 8,
    titleFont: "'Michroma', sans-serif",
    textFont: "'Poppins', sans-serif",
    name: "Michroma + Poppins",
    description: "Architectural & Soft"
  },
  {
    id: 9,
    titleFont: "'Saira Stencil One', cursive",
    textFont: "'Montserrat', sans-serif",
    name: "Saira Stencil + Montserrat",
    description: "Athletic & Elegant"
  },
  {
    id: 10,
    titleFont: "'Bungee', cursive",
    textFont: "'Raleway', sans-serif",
    name: "Bungee + Raleway",
    description: "Playful & Refined"
  },
  {
    id: 11,
    titleFont: "'Oswald', sans-serif",
    textFont: "'Merriweather Sans', sans-serif",
    name: "Oswald + Merriweather Sans",
    description: "News & Trustworthy"
  },
  {
    id: 12,
    titleFont: "'Anton', sans-serif",
    textFont: "'Nunito', sans-serif",
    name: "Anton + Nunito",
    description: "Heavy & Rounded"
  }
];

export default function FontShowcase() {
  const [selectedCombo, setSelectedCombo] = useState<number | null>(null);

  return (
    <>
      {/* Import all Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@400;600&family=Bebas+Neue&family=Roboto:wght@400;500&family=Black+Ops+One&family=Open+Sans:wght@400;600&family=Teko:wght@400;600;700&family=Lato:wght@400;700&family=Rajdhani:wght@400;600;700&family=Work+Sans:wght@400;600&family=Audiowide&family=Source+Sans+Pro:wght@400;600&family=Michroma&family=Poppins:wght@400;600&family=Saira+Stencil+One&family=Montserrat:wght@400;600&family=Bungee&family=Raleway:wght@400;600&family=Oswald:wght@400;600&family=Merriweather+Sans:wght@400;600&family=Anton&family=Nunito:wght@400;600&display=swap"
        rel="stylesheet"
      />
      
      <div className="min-h-screen bg-black text-white p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center gap-4 mb-4">
            <LightningLogo className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-blue-400">SHARPENED Font Showcase</h1>
          </div>
          <p className="text-gray-400">Click on any combination to see it highlighted. Choose the one that best represents the Sharpened brand.</p>
        </div>

        {/* Font Grid */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {fontCombinations.map((combo) => (
            <div
              key={combo.id}
              onClick={() => setSelectedCombo(combo.id)}
              className={`relative p-8 border-2 transition-all cursor-pointer ${
                selectedCombo === combo.id 
                  ? 'border-blue-400 bg-blue-500/10' 
                  : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
              }`}
              style={{ 
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
              }}
            >
              {/* Selection indicator */}
              {selectedCombo === combo.id && (
                <div className="absolute top-4 right-4">
                  <LightningLogo className="w-6 h-6 text-blue-400 animate-pulse" />
                </div>
              )}

              {/* Combination Name */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-blue-400">#{combo.id}</span>
                  <span className="text-sm text-gray-400">{combo.name}</span>
                </div>
                <span className="text-xs text-gray-500">{combo.description}</span>
              </div>

              {/* Title Font Demo */}
              <h2 
                className="text-5xl font-bold mb-2 text-white"
                style={{ fontFamily: combo.titleFont }}
              >
                {sampleTitle}
              </h2>

              {/* Subtitle Font Demo */}
              <h3 
                className="text-2xl font-semibold mb-4 text-blue-400"
                style={{ fontFamily: combo.titleFont }}
              >
                {sampleSubtitle}
              </h3>

              {/* Body Text Demo */}
              <p 
                className="text-base leading-relaxed text-gray-300 mb-4"
                style={{ fontFamily: combo.textFont }}
              >
                {sampleText}
              </p>

              {/* Button Demo */}
              <div className="flex gap-4 mt-6">
                <button 
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-400 transition-colors"
                  style={{ 
                    fontFamily: combo.titleFont,
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  START FREE
                </button>
                <button 
                  className="px-6 py-2 border border-gray-600 hover:border-gray-400 transition-colors"
                  style={{ 
                    fontFamily: combo.textFont,
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                  }}
                >
                  Learn More
                </button>
              </div>

              {/* Small Text Demo */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p 
                  className="text-xs text-gray-500"
                  style={{ fontFamily: combo.textFont }}
                >
                  Experience the future of fitness tracking. Join thousands of athletes using Sharpened technology.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Combination Display */}
        {selectedCombo && (
          <div className="fixed bottom-8 right-8 bg-blue-500/20 backdrop-blur-sm border border-blue-400 p-4 max-w-sm"
               style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}>
            <div className="flex items-center gap-2 mb-2">
              <LightningLogo className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-blue-400">SELECTED</span>
            </div>
            <p className="text-white font-semibold">
              {fontCombinations.find(c => c.id === selectedCombo)?.name}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              {fontCombinations.find(c => c.id === selectedCombo)?.description}
            </p>
          </div>
        )}
      </div>
    </>
  );
}