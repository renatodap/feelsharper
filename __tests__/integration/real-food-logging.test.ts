import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Mock the food search service for now
const foodSearchService = {
  search: async (query: string) => [{
    id: 1,
    description: `Test ${query}`,
    caloriesPer100g: 89,
    proteinG: 1.1,
    carbsG: 22.8,
    fatG: 0.3
  }]
};

describe('Real Food Logging Integration', () => {
  let supabase: any;
  let testUserId: string;

  beforeAll(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`);
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    
    // Use a fixed test user ID for integration tests
    testUserId = 'test-user-id-' + Date.now();
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await supabase.from('food_logs').delete().eq('user_id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('Food Search', () => {
    it('should find foods by name', async () => {
      const results = await foodSearchService.search('banana');
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('description');
      expect(results[0]).toHaveProperty('caloriesPer100g');
      expect(results[0].description.toLowerCase()).toContain('banana');
    });

    it('should return nutritional information', async () => {
      const results = await foodSearchService.search('chicken breast');
      
      expect(results[0]).toHaveProperty('proteinG');
      expect(results[0]).toHaveProperty('carbsG');
      expect(results[0]).toHaveProperty('fatG');
      expect(results[0].proteinG).toBeGreaterThan(15); // Chicken is high protein
    });
  });

  describe('Food Logging', () => {
    it('should log a food entry to database', async () => {
      const foodData = {
        user_id: testUserId,
        food_id: 1234,
        food_name: 'Test Banana',
        quantity_g: 150,
        calories: 133.5,
        protein_g: 1.65,
        carbs_g: 34.35,
        fat_g: 0.495,
        logged_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('food_logs')
        .insert(foodData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.food_name).toBe('Test Banana');
      expect(data.calories).toBe(133.5);
    });

    it('should retrieve user food logs', async () => {
      // First add a log
      await supabase.from('food_logs').insert({
        user_id: testUserId,
        food_name: 'Test Apple',
        quantity_g: 100,
        calories: 52,
        logged_at: new Date().toISOString()
      });

      // Then retrieve
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', testUserId)
        .order('logged_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].food_name).toBe('Test Apple');
    });

    it('should calculate daily totals', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Add multiple food logs for today
      await supabase.from('food_logs').insert([
        {
          user_id: testUserId,
          food_name: 'Breakfast',
          calories: 300,
          protein_g: 20,
          logged_at: `${today}T08:00:00Z`
        },
        {
          user_id: testUserId,
          food_name: 'Lunch',
          calories: 500,
          protein_g: 30,
          logged_at: `${today}T12:00:00Z`
        }
      ]);

      // Calculate totals
      const { data } = await supabase
        .from('food_logs')
        .select('calories, protein_g')
        .eq('user_id', testUserId)
        .gte('logged_at', `${today}T00:00:00Z`)
        .lte('logged_at', `${today}T23:59:59Z`);

      const totals = data?.reduce((acc: any, log: any) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein_g
      }), { calories: 0, protein: 0 });

      expect(totals.calories).toBeGreaterThanOrEqual(800);
      expect(totals.protein).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Custom Foods', () => {
    it('should allow creating custom foods', async () => {
      const customFood = {
        user_id: testUserId,
        description: 'My Protein Shake',
        brand_name: 'Homemade',
        calories_per_100g: 120,
        protein_g: 25,
        carbs_g: 5,
        fat_g: 2,
        verified: false
      };

      const { data, error } = await supabase
        .from('custom_foods')
        .insert(customFood)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.description).toBe('My Protein Shake');
      expect(data.user_id).toBe(testUserId);
    });
  });
});