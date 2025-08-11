'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
const Label = ({ children, htmlFor, className }: any) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;
// Tabs components
const Tabs = ({ children, defaultValue, className }: any) => <div className={className}>{children}</div>;
const TabsList = ({ children, className }: any) => <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>{children}</div>;
const TabsTrigger = ({ children, value, className }: any) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className || ''}`}>{children}</button>;
const TabsContent = ({ children, value, className }: any) => <div className={className}>{children}</div>;
import { TrendingUp, TrendingDown, Minus, Scale, Ruler, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Metric {
  id: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  measured_at: string;
}

export function BodyMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [latest, setLatest] = useState<Metric | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newMetric, setNewMetric] = useState({
    weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    waist: '',
    chest: '',
    arms: '',
    thighs: '',
    calves: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/metrics?days=30');
      const data = await response.json();
      setMetrics(data.metrics || []);
      setLatest(data.latest || null);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const saveMetric = async () => {
    if (!newMetric.weight) {
      toast({
        title: 'Error',
        description: 'Please enter at least your weight',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(newMetric.weight) || 0,
          body_fat_percentage: parseFloat(newMetric.body_fat_percentage) || null,
          muscle_mass: parseFloat(newMetric.muscle_mass) || null,
          waist: parseFloat(newMetric.waist) || null,
          chest: parseFloat(newMetric.chest) || null,
          arms: parseFloat(newMetric.arms) || null,
          thighs: parseFloat(newMetric.thighs) || null,
          calves: parseFloat(newMetric.calves) || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save metric');

      toast({
        title: 'Metrics Saved!',
        description: 'Your body metrics have been recorded',
      });

      // Reset form
      setNewMetric({
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        waist: '',
        chest: '',
        arms: '',
        thighs: '',
        calves: '',
      });

      // Reload metrics
      loadMetrics();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save metrics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateChange = (current: number, previous?: number) => {
    if (!previous) return { value: 0, trend: 'neutral' as const };
    const change = current - previous;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    return { value: Math.abs(change), trend };
  };

  const previousMetric = metrics[metrics.length - 2];
  const weightChange = latest ? calculateChange(latest.weight, previousMetric?.weight) : null;

  return (
    <div className="space-y-4">
      {/* Current Stats */}
      {latest && (
        <Card>
          <CardHeader>
            <CardTitle>Current Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Weight</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{latest.weight} kg</span>
                  {weightChange && weightChange.value > 0 && (
                    <div className={`flex items-center text-sm ${
                      weightChange.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {weightChange.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{weightChange.value.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(latest.measured_at), 'MMM d, yyyy')}
                </div>
              </div>

              {latest.body_fat_percentage && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Body Fat</span>
                  </div>
                  <div className="text-2xl font-bold">{latest.body_fat_percentage}%</div>
                </div>
              )}

              {latest.muscle_mass && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Muscle Mass</span>
                  </div>
                  <div className="text-2xl font-bold">{latest.muscle_mass} kg</div>
                </div>
              )}

              {latest.waist && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Waist</span>
                  </div>
                  <div className="text-2xl font-bold">{latest.waist} cm</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Update Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="75.5"
                  value={newMetric.weight}
                  onChange={(e) => setNewMetric({ ...newMetric, weight: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="body-fat">Body Fat %</Label>
                  <Input
                    id="body-fat"
                    type="number"
                    step="0.1"
                    placeholder="15.5"
                    value={newMetric.body_fat_percentage}
                    onChange={(e) => setNewMetric({ ...newMetric, body_fat_percentage: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="muscle-mass">Muscle Mass (kg)</Label>
                  <Input
                    id="muscle-mass"
                    type="number"
                    step="0.1"
                    placeholder="35.0"
                    value={newMetric.muscle_mass}
                    onChange={(e) => setNewMetric({ ...newMetric, muscle_mass: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="measurements" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.5"
                    placeholder="85"
                    value={newMetric.waist}
                    onChange={(e) => setNewMetric({ ...newMetric, waist: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="chest">Chest (cm)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.5"
                    placeholder="105"
                    value={newMetric.chest}
                    onChange={(e) => setNewMetric({ ...newMetric, chest: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="arms">Arms (cm)</Label>
                  <Input
                    id="arms"
                    type="number"
                    step="0.5"
                    placeholder="38"
                    value={newMetric.arms}
                    onChange={(e) => setNewMetric({ ...newMetric, arms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="thighs">Thighs (cm)</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.5"
                    placeholder="60"
                    value={newMetric.thighs}
                    onChange={(e) => setNewMetric({ ...newMetric, thighs: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="calves">Calves (cm)</Label>
                <Input
                  id="calves"
                  type="number"
                  step="0.5"
                  placeholder="40"
                  value={newMetric.calves}
                  onChange={(e) => setNewMetric({ ...newMetric, calves: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={saveMetric} disabled={isLoading} className="w-full mt-4">
            Save Metrics
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.slice(-7).reverse().map((metric) => (
                <div key={metric.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(metric.measured_at), 'MMM d')}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">{metric.weight} kg</span>
                    {metric.body_fat_percentage && (
                      <span className="text-muted-foreground">{metric.body_fat_percentage}% BF</span>
                    )}
                    {metric.waist && (
                      <span className="text-muted-foreground">{metric.waist}cm waist</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}