'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
const CardTitle = ({ children, className }: any) => <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
const Label = ({ children, htmlFor, className }: any) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;
// Simplified Select components
const Select = ({ children, value, onValueChange }: any) => <div>{children}</div>;
const SelectTrigger = ({ children }: any) => <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{children}</button>;
const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
const SelectContent = ({ children }: any) => <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">{children}</div>;
const SelectItem = ({ children, value }: any) => <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">{children}</div>;
// Tabs components
const Tabs = ({ children, value, onValueChange }: any) => <div>{children}</div>;
const TabsList = ({ children, className }: any) => <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>{children}</div>;
const TabsTrigger = ({ children, value, className }: any) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className || ''}`}>{children}</button>;
const TabsContent = ({ children, value, className }: any) => <div className={`mt-2 ${className || ''}`}>{children}</div>;
import { Plus, Coffee, Sun, Moon, Apple, Flame, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Meal {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  consumed_at: string;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee },
  { value: 'lunch', label: 'Lunch', icon: Sun },
  { value: 'dinner', label: 'Dinner', icon: Moon },
  { value: 'snack', label: 'Snack', icon: Apple },
];

export function MealTracker() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [activeTab, setActiveTab] = useState('quick');
  const [quickEntry, setQuickEntry] = useState({
    meal_type: 'lunch',
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodaysMeals();
  }, []);

  const loadTodaysMeals = async () => {
    try {
      const response = await fetch(`/api/meals?date=${today}`);
      const data = await response.json();
      setMeals(data.meals || []);
      setTotals(data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } catch (error) {
      console.error('Failed to load meals:', error);
    }
  };

  const addMeal = async () => {
    if (!quickEntry.name || !quickEntry.calories) {
      toast({
        title: 'Error',
        description: 'Please enter at least a name and calories',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_type: quickEntry.meal_type,
          name: quickEntry.name,
          calories: parseInt(quickEntry.calories) || 0,
          protein: parseFloat(quickEntry.protein) || 0,
          carbs: parseFloat(quickEntry.carbs) || 0,
          fat: parseFloat(quickEntry.fat) || 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to add meal');

      toast({
        title: 'Meal Added!',
        description: `${quickEntry.name} logged successfully`,
      });

      // Reset form
      setQuickEntry({
        meal_type: quickEntry.meal_type,
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
      });

      // Reload meals
      loadTodaysMeals();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add meal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calorieGoal = 2400; // This should come from user preferences
  const proteinGoal = 180; // This should come from user preferences

  const caloriePercentage = Math.min((totals.calories / calorieGoal) * 100, 100);
  const proteinPercentage = Math.min((totals.protein / proteinGoal) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Calories</span>
                </div>
                <span className="text-sm">
                  {totals.calories} / {calorieGoal}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${caloriePercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Protein</span>
                </div>
                <span className="text-sm">
                  {totals.protein}g / {proteinGoal}g
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${proteinPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totals.carbs}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totals.fat}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totals.protein}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Add Meal</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick">Quick Entry</TabsTrigger>
              <TabsTrigger value="search">Search Food</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-4">
              <div>
                <Label>Meal Type</Label>
                <Select 
                  value={quickEntry.meal_type} 
                  onValueChange={(value) => setQuickEntry({ ...quickEntry, meal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="food-name">Food Name</Label>
                <Input
                  id="food-name"
                  placeholder="e.g., Chicken breast with rice"
                  value={quickEntry.name}
                  onChange={(e) => setQuickEntry({ ...quickEntry, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="350"
                    value={quickEntry.calories}
                    onChange={(e) => setQuickEntry({ ...quickEntry, calories: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="35"
                    value={quickEntry.protein}
                    onChange={(e) => setQuickEntry({ ...quickEntry, protein: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="40"
                    value={quickEntry.carbs}
                    onChange={(e) => setQuickEntry({ ...quickEntry, carbs: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    placeholder="8"
                    value={quickEntry.fat}
                    onChange={(e) => setQuickEntry({ ...quickEntry, fat: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={addMeal} disabled={isLoading} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                Food database search coming soon!
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Today&apos;s Meals */}
      {meals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MEAL_TYPES.map((mealType) => {
                const typeMeals = meals.filter(m => m.meal_type === mealType.value);
                if (typeMeals.length === 0) return null;

                return (
                  <div key={mealType.value}>
                    <div className="flex items-center gap-2 mb-2">
                      <mealType.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{mealType.label}</span>
                    </div>
                    <div className="space-y-2 pl-6">
                      {typeMeals.map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between text-sm">
                          <span>{meal.name}</span>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span>{meal.calories} cal</span>
                            <span>{meal.protein}g protein</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}