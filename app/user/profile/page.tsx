'use client';

import { useState } from 'react';
import { 
  User,
  Users,
  Trophy,
  Target,
  Share2,
  Shield,
  Heart,
  Zap,
  ChevronRight
} from 'lucide-react';

const LightningLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M 65 5 L 45 40 L 55 40 L 35 95 L 55 60 L 45 60 Z" />
  </svg>
);

// Community challenges
const communityChallenges = [
  { id: 1, name: "January Marathon", participants: 234, days: 12, joined: false },
  { id: 2, name: "100 Workout Challenge", participants: 567, days: 45, joined: true },
  { id: 3, name: "Daily Movement", participants: 892, days: 7, joined: true }
];

// Leaderboard
const leaderboard = [
  { rank: 1, name: "Alex R.", points: 3450, trend: 'up' },
  { rank: 2, name: "Sarah K.", points: 3200, trend: 'up' },
  { rank: 3, name: "You", points: 2890, trend: 'same' },
  { rank: 4, name: "Mike T.", points: 2750, trend: 'down' },
  { rank: 5, name: "Jordan L.", points: 2600, trend: 'up' }
];

export default function ProfileCommunityPage() {
  const [motivationStyle, setMotivationStyle] = useState<'tough' | 'gentle' | 'balanced'>('balanced');
  const [accountabilityPartner, setAccountabilityPartner] = useState('');
  const [publicGoals, setPublicGoals] = useState(true);
  const [joinLeaderboard, setJoinLeaderboard] = useState(true);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-white mb-2">
          Profile & <span className="text-feel-primary lightning-text">Community</span>
        </h1>
        <p className="text-sharpened-light-gray font-body">
          Social accountability & personal preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Profile Settings */}
        <div>
          {/* Motivation Style */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-feel-primary" />
              <h2 className="text-2xl font-heading font-bold text-white">Motivation Style</h2>
            </div>
            
            <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
                 style={{
                   clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                 }}>
              <p className="text-sharpened-light-gray font-body mb-4">
                How would you like your AI coach to motivate you?
              </p>
              
              <div className="space-y-3">
                {[
                  { value: 'tough' as const, label: 'Tough Love', desc: 'Direct, no-excuses approach' },
                  { value: 'gentle' as const, label: 'Gentle Encouragement', desc: 'Supportive and understanding' },
                  { value: 'balanced' as const, label: 'Balanced', desc: 'Mix of push and support' }
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setMotivationStyle(style.value)}
                    className={`w-full p-4 text-left border transition-all ${
                      motivationStyle === style.value
                        ? 'bg-feel-primary/10 border-feel-primary/50'
                        : 'bg-sharpened-void/30 border-sharpened-charcoal hover:border-feel-primary/30'
                    }`}
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-body font-semibold text-white">{style.label}</div>
                        <div className="text-sm text-sharpened-gray font-body">{style.desc}</div>
                      </div>
                      {motivationStyle === style.value && (
                        <div className="w-6 h-6 bg-feel-primary flex items-center justify-center"
                             style={{
                               clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                             }}>
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Accountability Partner */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-feel-primary" />
              <h2 className="text-2xl font-heading font-bold text-white">Accountability Partner</h2>
            </div>
            
            <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
                 style={{
                   clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                 }}>
              <p className="text-sharpened-light-gray font-body mb-4">
                Add a buddy to keep each other accountable
              </p>
              
              <input
                type="email"
                value={accountabilityPartner}
                onChange={(e) => setAccountabilityPartner(e.target.value)}
                placeholder="Enter partner's email..."
                className="w-full px-4 py-3 bg-sharpened-void/50 border border-sharpened-charcoal text-white placeholder-sharpened-gray font-body focus:outline-none focus:border-feel-primary/50 transition-colors mb-4"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                }}
              />
              
              <button className="w-full px-6 py-3 bg-feel-primary hover:bg-feel-secondary text-white font-heading font-bold transition-colors"
                      style={{
                        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                      }}>
                Send Invite
              </button>
            </div>
          </div>

          {/* Public Commitment */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-6 h-6 text-feel-primary" />
              <h2 className="text-2xl font-heading font-bold text-white">Public Commitment</h2>
            </div>
            
            <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal p-6"
                 style={{
                   clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))'
                 }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-body font-semibold text-white">Share Goals Publicly</div>
                    <div className="text-sm text-sharpened-gray font-body">Let others see your targets</div>
                  </div>
                  <button
                    onClick={() => setPublicGoals(!publicGoals)}
                    className={`relative w-14 h-7 transition-colors ${
                      publicGoals ? 'bg-feel-primary' : 'bg-sharpened-charcoal'
                    }`}
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))'
                    }}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
                      publicGoals ? 'translate-x-7' : 'translate-x-1'
                    }`}
                         style={{
                           clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                         }} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-body font-semibold text-white">Join Leaderboards</div>
                    <div className="text-sm text-sharpened-gray font-body">Compete with the community</div>
                  </div>
                  <button
                    onClick={() => setJoinLeaderboard(!joinLeaderboard)}
                    className={`relative w-14 h-7 transition-colors ${
                      joinLeaderboard ? 'bg-feel-primary' : 'bg-sharpened-charcoal'
                    }`}
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))'
                    }}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
                      joinLeaderboard ? 'translate-x-7' : 'translate-x-1'
                    }`}
                         style={{
                           clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                         }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Community */}
        <div>
          {/* Community Challenges */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-feel-primary" />
              <h2 className="text-2xl font-heading font-bold text-white">Community Challenges</h2>
            </div>
            
            <div className="space-y-3">
              {communityChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`bg-sharpened-coal/30 backdrop-blur-sm border p-4 transition-all ${
                    challenge.joined ? 'border-feel-primary/50' : 'border-sharpened-charcoal hover:border-feel-primary/30'
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-body font-semibold text-white">{challenge.name}</h3>
                    {challenge.joined ? (
                      <span className="text-xs font-body font-semibold text-feel-primary bg-feel-primary/10 px-2 py-1">
                        JOINED
                      </span>
                    ) : (
                      <button className="text-feel-primary hover:text-feel-secondary transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-sharpened-gray font-body">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {challenge.participants} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {challenge.days} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-feel-primary" />
              <h2 className="text-2xl font-heading font-bold text-white">Leaderboard</h2>
            </div>
            
            <div className="bg-sharpened-coal/30 backdrop-blur-sm border border-sharpened-charcoal"
                 style={{
                   clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
                 }}>
              <div className="p-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between py-3 border-b border-sharpened-charcoal last:border-0 ${
                      entry.name === 'You' ? 'bg-feel-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center font-heading font-bold ${
                        entry.rank <= 3 ? 'text-yellow-400' : 'text-sharpened-gray'
                      }`}>
                        #{entry.rank}
                      </div>
                      <span className={`font-body font-semibold ${
                        entry.name === 'You' ? 'text-feel-primary' : 'text-white'
                      }`}>
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-white">{entry.points}</span>
                      {entry.trend === 'up' && <span className="text-green-400">↑</span>}
                      {entry.trend === 'down' && <span className="text-red-400">↓</span>}
                      {entry.trend === 'same' && <span className="text-yellow-400">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}