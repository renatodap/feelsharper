/**
 * Phase 10 Dashboard - Revolutionary Features Status
 * Visual monitoring for all Phase 10 capabilities
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Database, 
  BookOpen, 
  Camera, 
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Brain,
  Sparkles
} from 'lucide-react';

interface Phase10Status {
  phase10Status: string;
  results: {
    timestamp: string;
    phase10Status: {
      overallHealth: number;
      lastHealthCheck: string;
      schemaEvolution: boolean;
      knowledgeUpdates: boolean;
      foodRecognition: boolean;
      quickLogs: boolean;
    };
    tests: {
      [key: string]: {
        status: string;
        feature: string;
        details?: any;
        revolutionary?: string[];
        confidence?: number;
        error?: string;
      };
    };
    summary: {
      testsRun: number;
      testsPassed: number;
      revolutionaryFeaturesWorking: number;
      confidence: number;
    };
  };
  revolutionary_capabilities: string[];
  next_steps: string[];
}

export function Phase10Dashboard() {
  const [status, setStatus] = useState<Phase10Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Never');

  const runPhase10Tests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/phase10/test-all');
      const data = await response.json();
      setStatus(data);
      setLastUpdate(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to run Phase 10 tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run tests on component mount
    runPhase10Tests();
  }, []);

  const getStatusIcon = (testStatus: string) => {
    switch (testStatus) {
      case 'PASS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PARTIAL': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'FAIL': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (testStatus: string) => {
    switch (testStatus) {
      case 'PASS': return 'bg-green-50 border-green-200';
      case 'PARTIAL': return 'bg-yellow-50 border-yellow-200';
      case 'FAIL': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getFeatureIcon = (featureName: string) => {
    if (featureName.includes('Schema')) return <Database className="w-6 h-6" />;
    if (featureName.includes('Knowledge')) return <BookOpen className="w-6 h-6" />;
    if (featureName.includes('Photo')) return <Camera className="w-6 h-6" />;
    if (featureName.includes('Quick')) return <Zap className="w-6 h-6" />;
    return <Activity className="w-6 h-6" />;
  };

  if (!status) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-feel-primary" />
            <h2 className="text-2xl font-bold text-text-primary">Phase 10 Dashboard</h2>
          </div>
          <p className="text-text-secondary mb-6">Revolutionary AI-powered fitness features</p>
          <Button 
            onClick={runPhase10Tests} 
            disabled={loading}
            className="bg-feel-primary hover:bg-feel-primary/90"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Initialize Phase 10
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const overallHealth = status.results?.phase10Status?.overallHealth || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-feel-primary" />
          <h2 className="text-2xl font-bold text-text-primary">Phase 10 Dashboard</h2>
        </div>
        <Badge 
          className={`text-sm px-3 py-1 ${
            status.phase10Status === 'FULLY_FUNCTIONAL' ? 'bg-green-100 text-green-800' :
            status.phase10Status === 'PARTIALLY_FUNCTIONAL' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}
        >
          {status.phase10Status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Overall Health Card */}
      <Card className="border-2 border-feel-primary/20 bg-gradient-to-r from-feel-primary/5 to-success/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">System Health</h3>
            <Button 
              onClick={runPhase10Tests} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-feel-primary">{overallHealth}%</div>
              <div className="text-sm text-text-secondary">Overall Health</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {status.results?.summary?.revolutionaryFeaturesWorking || 0}/4
              </div>
              <div className="text-sm text-text-secondary">Features Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-navy">
                {status.results?.summary?.confidence || 0}%
              </div>
              <div className="text-sm text-text-secondary">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {status.results?.summary?.testsPassed || 0}/{status.results?.summary?.testsRun || 0}
              </div>
              <div className="text-sm text-text-secondary">Tests Passed</div>
            </div>
          </div>

          <div className="text-xs text-text-secondary">
            Last updated: {lastUpdate}
          </div>
        </CardContent>
      </Card>

      {/* Individual Features */}
      {status.results?.tests && (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(status.results.tests).map(([key, test]) => (
            <Card key={key} className={`border-2 ${getStatusColor(test.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getFeatureIcon(test.feature)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(test.status)}
                      <h4 className="font-semibold text-sm text-text-primary truncate">
                        {test.feature}
                      </h4>
                      {test.confidence && (
                        <Badge className="text-xs">
                          {test.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                    
                    {test.revolutionary && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-text-secondary mb-1">Revolutionary capabilities:</p>
                        <ul className="text-xs text-text-secondary space-y-1">
                          {test.revolutionary.slice(0, 2).map((capability, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-feel-primary mt-1">•</span>
                              <span>{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {test.details && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(test.details).map(([detailKey, detailValue]) => (
                          <div key={detailKey} className="flex justify-between">
                            <span className="text-text-secondary capitalize">
                              {detailKey.replace(/([A-Z])/g, ' $1')}:
                            </span>
                            <span className="text-text-primary font-medium">
                              {typeof detailValue === 'number' ? detailValue : String(detailValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {test.error && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          Error: {test.error}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Revolutionary Capabilities */}
      {status.revolutionary_capabilities && (
        <Card className="border border-success/30 bg-gradient-to-r from-success/5 to-feel-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="font-semibold text-text-primary">Revolutionary Capabilities</h3>
            </div>
            <div className="space-y-2">
              {status.revolutionary_capabilities.map((capability, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{capability}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {status.next_steps && (
        <Card className="border border-navy/30 bg-navy/5">
          <CardContent className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">Next Steps</h3>
            <div className="space-y-2">
              {status.next_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-navy text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-text-secondary">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}