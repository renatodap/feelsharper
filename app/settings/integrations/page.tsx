'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Smartphone, 
  Activity, 
  Heart, 
  Moon, 
  Zap,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Trash2
} from 'lucide-react';

interface IntegrationAccount {
  id: string;
  provider: string;
  externalUserId?: string;
  lastSyncAt?: string;
  revokedAt?: string;
  metadata: Record<string, any>;
}

interface ProviderConfig {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'health' | 'fitness' | 'social' | 'nutrition';
  platforms: string[];
  benefits: string[];
  dataTypes: string[];
  available: boolean;
  betaOnly?: boolean;
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  healthkit: {
    name: 'Apple Health',
    description: 'Sync workouts, heart rate, and sleep from your iPhone and Apple Watch',
    icon: Smartphone,
    category: 'health',
    platforms: ['iOS'],
    benefits: ['1-tap workout logging', 'Real-time heart rate', 'Sleep insights'],
    dataTypes: ['Workouts', 'Heart Rate', 'Sleep', 'Steps'],
    available: true
  },
  googlefit: {
    name: 'Google Fit',
    description: 'Connect your Android device and fitness apps for seamless tracking',
    icon: Activity,
    category: 'fitness',
    platforms: ['Android'],
    benefits: ['Automatic activity detection', 'Multi-app sync', 'Step tracking'],
    dataTypes: ['Activities', 'Heart Rate', 'Sleep', 'Steps'],
    available: true
  },
  strava: {
    name: 'Strava',
    description: 'Import runs and rides, optionally share progress with your network',
    icon: Zap,
    category: 'fitness',
    platforms: ['Web', 'Mobile'],
    benefits: ['Social motivation', 'Route tracking', 'Performance analysis'],
    dataTypes: ['Activities', 'Routes', 'Segments'],
    available: true,
    betaOnly: true
  },
  garmin: {
    name: 'Garmin Connect',
    description: 'Professional-grade metrics for serious athletes',
    icon: Heart,
    category: 'fitness',
    platforms: ['Garmin Devices'],
    benefits: ['Advanced metrics', 'Training load', 'Recovery insights'],
    dataTypes: ['Activities', 'Heart Rate', 'Sleep', 'Stress'],
    available: false // Requires dev approval
  },
  oura: {
    name: 'Oura Ring',
    description: 'Elite sleep and recovery insights for optimal performance',
    icon: Moon,
    category: 'health',
    platforms: ['Oura Ring'],
    benefits: ['Sleep stages', 'HRV tracking', 'Readiness score'],
    dataTypes: ['Sleep', 'HRV', 'Temperature', 'Readiness'],
    available: false // Premium feature
  },
  discord: {
    name: 'Discord',
    description: 'Share weekly squad progress in your Discord server',
    icon: MessageSquare,
    category: 'social',
    platforms: ['Discord'],
    benefits: ['Team motivation', 'Weekly recaps', 'Community building'],
    dataTypes: ['Squad Updates', 'Progress Summaries'],
    available: true
  }
};

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<IntegrationAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase
        .from('integration_accounts')
        .select('*')
        .is('revoked_at', null);

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const response = await fetch(`/api/integrations/${provider}/oauth/start`);
      const data = await response.json();

      if (response.ok && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Failed to start OAuth flow');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect. Please try again.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect ${PROVIDER_CONFIGS[provider]?.name}?`)) {
      return;
    }

    setDisconnecting(provider);
    try {
      const response = await fetch(`/api/integrations/${provider}/disconnect`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadIntegrations();
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      alert('Failed to disconnect. Please try again.');
    } finally {
      setDisconnecting(null);
    }
  };

  const getAccountForProvider = (provider: string) => {
    return accounts.find(account => account.provider === provider);
  };

  const formatLastSync = (lastSyncAt?: string) => {
    if (!lastSyncAt) return 'Never';
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categorizedProviders = Object.entries(PROVIDER_CONFIGS).reduce((acc, [key, config]) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push({ key, ...config });
    return acc;
  }, {} as Record<string, Array<{ key: string } & ProviderConfig>>);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Connected Apps & Devices</h1>
        <p className="text-gray-600">
          Connect your favorite fitness apps and devices to get personalized coaching and seamless tracking.
        </p>
      </div>

      {Object.entries(categorizedProviders).map(([category, providers]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
            {category === 'health' && <Heart className="w-5 h-5" />}
            {category === 'fitness' && <Activity className="w-5 h-5" />}
            {category === 'social' && <MessageSquare className="w-5 h-5" />}
            {category === 'nutrition' && <Zap className="w-5 h-5" />}
            {category} Integrations
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map(({ key, ...config }) => {
              const account = getAccountForProvider(key);
              const isConnected = !!account;
              const Icon = config.icon;

              return (
                <Card key={key} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {config.name}
                          {config.betaOnly && (
                            <Badge variant="secondary" className="text-xs">Beta</Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {config.platforms.join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : !config.available ? (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    ) : null}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{config.description}</p>

                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">Data Types</div>
                    <div className="flex flex-wrap gap-1">
                      {config.dataTypes.map(type => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {isConnected && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        Connected
                      </div>
                      <div className="text-xs text-green-600">
                        Last sync: {formatLastSync(account.lastSyncAt)}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={disconnecting === key}
                          onClick={() => handleDisconnect(key)}
                        >
                          {disconnecting === key ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2" />
                              Disconnecting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Disconnect
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </>
                    ) : config.available ? (
                      <Button
                        className="flex-1"
                        disabled={connecting === key}
                        onClick={() => handleConnect(key)}
                      >
                        {connecting === key ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button variant="ghost" className="flex-1" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Privacy & Security</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your data is encrypted and stored securely. You can disconnect any integration at any time, 
          and we&apos;ll permanently delete the associated data within 30 days.
        </p>
        <div className="flex gap-4 text-sm">
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          <a href="/security" className="text-blue-600 hover:underline">Security</a>
          <a href="/support" className="text-blue-600 hover:underline">Support</a>
        </div>
      </div>
    </div>
  );
}
