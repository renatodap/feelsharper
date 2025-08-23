'use client';

import { Orbitron, Russo_One } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });
const russoOne = Russo_One({ subsets: ['latin'], weight: '400' });

export default function TestFonts() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl mb-8">Font Test Page</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl mb-2 text-blue-400">Default Font:</h2>
          <p className="text-xl">This is the default font - should be system font</p>
        </div>
        
        <div>
          <h2 className="text-2xl mb-2 text-blue-400">Orbitron Font:</h2>
          <p className={`text-xl ${orbitron.className}`}>This is Orbitron font - should look techy/electric</p>
        </div>
        
        <div>
          <h2 className="text-2xl mb-2 text-blue-400">Russo One Font:</h2>
          <p className={`text-xl ${russoOne.className}`}>This is Russo One font - should look bold/blocky</p>
        </div>
        
        <div>
          <h2 className="text-2xl mb-2 text-blue-400">Lightning SVG Test:</h2>
          <svg className="w-32 h-32 text-blue-400" viewBox="0 0 2000 2000" fill="currentColor">
            <path d="M1316.51,114.18l-179.59,539.46c119.07,100.86,266.86,187.13,380.91,292.16,16.83,15.5,52.29,42.07,46.89,65.3l-881.44,874.73,179.44-546.25-393.53-298.18c-12.77-15.4-41.59-28.37-32.85-51.14L1316.51,114.18Z"/>
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl mb-2 text-blue-400">Simple SVG Test:</h2>
          <svg className="w-32 h-32" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" fill="#3B82F6" />
            <circle cx="50" cy="50" r="30" fill="#06B6D4" />
          </svg>
        </div>
      </div>
    </div>
  );
}