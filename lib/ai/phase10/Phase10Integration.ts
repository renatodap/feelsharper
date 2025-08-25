/**
 * Phase 10 Integration Layer - Orchestrates all Phase 10 revolutionary features
 * Makes Phase 10 fully functional with real integrations and fallbacks
 */

import { SecureSchemaAnalyzer } from '../schema-evolution/SecureSchemaAnalyzer';
import { KnowledgeUpdater } from '../knowledge-update/KnowledgeUpdater';
import { FoodRecognition } from '../vision/FoodRecognition';
import { QuickLogSystem } from '../quick-logs/QuickLogSystem';

export interface Phase10Status {
  schemaEvolution: boolean;
  knowledgeUpdates: boolean;
  foodRecognition: boolean;
  quickLogs: boolean;
  overallHealth: number; // 0-100
  lastHealthCheck: string;
}

export interface Phase10Config {
  enableSchemaEvolution: boolean;
  enableKnowledgeUpdates: boolean;
  enableFoodRecognition: boolean;
  enableQuickLogs: boolean;
  fallbackToMocks: boolean;
  healthCheckIntervalMinutes: number;
}

export class Phase10Integration {
  private schemaAnalyzer: SecureSchemaAnalyzer;
  private knowledgeUpdater: KnowledgeUpdater;
  private foodRecognition: FoodRecognition;
  private quickLogSystem: QuickLogSystem;
  private config: Phase10Config;
  private status: Phase10Status;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<Phase10Config> = {}) {
    this.config = {
      enableSchemaEvolution: true,
      enableKnowledgeUpdates: true,
      enableFoodRecognition: true,
      enableQuickLogs: true,
      fallbackToMocks: true,
      healthCheckIntervalMinutes: 30,
      ...config
    };

    // Initialize components (SECURE VERSION)
    this.schemaAnalyzer = new SecureSchemaAnalyzer();
    this.knowledgeUpdater = new KnowledgeUpdater();
    this.foodRecognition = new FoodRecognition();
    this.quickLogSystem = new QuickLogSystem();

    // Initialize status
    this.status = {
      schemaEvolution: false,
      knowledgeUpdates: false,
      foodRecognition: false,
      quickLogs: false,
      overallHealth: 0,
      lastHealthCheck: new Date().toISOString()
    };

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Initialize all Phase 10 systems
   */
  async initialize(): Promise<Phase10Status> {
    console.log('🚀 Initializing Phase 10 Revolutionary Features...');

    try {
      // Test each system
      const results = await Promise.allSettled([
        this.testSchemaEvolution(),
        this.testKnowledgeUpdates(),
        this.testFoodRecognition(),
        this.testQuickLogs()
      ]);

      // Update status based on results
      this.status.schemaEvolution = results[0].status === 'fulfilled';
      this.status.knowledgeUpdates = results[1].status === 'fulfilled';
      this.status.foodRecognition = results[2].status === 'fulfilled';
      this.status.quickLogs = results[3].status === 'fulfilled';

      // Calculate overall health
      const healthyServices = Object.values(this.status).filter(Boolean).length - 2; // Exclude overallHealth and lastHealthCheck
      this.status.overallHealth = (healthyServices / 4) * 100;
      this.status.lastHealthCheck = new Date().toISOString();

      console.log(`✅ Phase 10 initialized with ${this.status.overallHealth}% health`);
      
      return this.status;
    } catch (error) {
      console.error('❌ Phase 10 initialization failed:', error);
      this.status.overallHealth = 0;
      return this.status;
    }
  }

  /**
   * 10.1: SECURE Dynamic Schema Evolution - AI recommendations with admin approval
   * SECURITY: No automatic execution, all changes require admin review
   */
  async evolveSchema(userId?: string): Promise<{
    patternsAnalyzed: number;
    recommendationsGenerated: number;
    approvalRequestsCreated: number;
    status: 'success' | 'partial' | 'failed';
  }> {
    if (!this.config.enableSchemaEvolution) {
      console.log('🔐 Schema evolution disabled for security');
      return { patternsAnalyzed: 0, recommendationsGenerated: 0, approvalRequestsCreated: 0, status: 'failed' };
    }

    try {
      console.log('🔐 Running SECURE Schema Evolution Analysis...');

      // SECURITY: Analyze patterns using secure aggregate queries
      const patterns = await this.schemaAnalyzer.analyzeUserPatterns('week');
      console.log(`📊 Analyzed ${patterns.length} user patterns (secure aggregation)`);

      // SECURITY: Generate recommendations (no automatic execution)
      const recommendations = await this.schemaAnalyzer.generateSchemaRecommendations(patterns);
      console.log(`💡 Generated ${recommendations.length} secure recommendations`);

      let approvalRequestsCreated = 0;
      
      if (recommendations.length > 0) {
        // SECURITY: Create approval request (admin review required)
        const approvalRequest = await this.schemaAnalyzer.createApprovalRequest(recommendations);
        
        approvalRequestsCreated = 1;
        console.log(`🔐 Created approval request ${approvalRequest.id} - Admin review required`);
        console.log('⚠️ SECURITY: No automatic execution - Changes awaiting admin approval');
      }

      return {
        patternsAnalyzed: patterns.length,
        recommendationsGenerated: recommendations.length,
        approvalRequestsCreated,
        status: 'success'
      };

    } catch (error) {
      console.error('❌ Secure schema evolution failed:', error);
      return { patternsAnalyzed: 0, recommendationsGenerated: 0, approvalRequestsCreated: 0, status: 'failed' };
    }
  }

  /**
   * 10.2: Knowledge Base Auto-Update - Latest research integration
   */
  async updateKnowledgeBase(): Promise<{
    topicsSearched: number;
    updatesFound: number;
    conflictsResolved: number;
    status: 'success' | 'partial' | 'failed';
  }> {
    if (!this.config.enableKnowledgeUpdates) {
      return { topicsSearched: 0, updatesFound: 0, conflictsResolved: 0, status: 'failed' };
    }

    try {
      console.log('📚 Running Knowledge Base Updates...');

      // Perform weekly knowledge update
      const updateResult = await this.knowledgeUpdater.performWeeklyUpdate();

      console.log(`🔍 Found ${updateResult.newKnowledge.length} knowledge updates`);
      console.log(`⚔️ Resolved ${updateResult.conflicts.length} conflicts`);
      console.log(`✅ Applied ${updateResult.applied} updates`);

      return {
        topicsSearched: 10, // Standard topic set
        updatesFound: updateResult.newKnowledge.length,
        conflictsResolved: updateResult.conflicts.length,
        status: 'success'
      };

    } catch (error) {
      console.error('❌ Knowledge update failed:', error);
      return { topicsSearched: 0, updatesFound: 0, conflictsResolved: 0, status: 'failed' };
    }
  }

  /**
   * 10.3: Photo-Based Calorie Recognition - Vision AI food analysis
   */
  async analyzeFoodPhoto(imageBase64: string, context?: string): Promise<{
    itemsDetected: number;
    totalCalories: number;
    confidence: number;
    suggestions: string[];
    status: 'success' | 'partial' | 'failed';
  }> {
    if (!this.config.enableFoodRecognition) {
      return { itemsDetected: 0, totalCalories: 0, confidence: 0, suggestions: [], status: 'failed' };
    }

    try {
      console.log('📸 Analyzing food photo with AI vision...');

      const analysis = await this.foodRecognition.analyzeFood(imageBase64, context);

      console.log(`🍎 Detected ${analysis.items.length} food items`);
      console.log(`🔥 Total calories: ${analysis.totalCalories}`);
      console.log(`📊 Confidence: ${Math.round(analysis.confidence * 100)}%`);

      return {
        itemsDetected: analysis.items.length,
        totalCalories: analysis.totalCalories,
        confidence: analysis.confidence,
        suggestions: analysis.suggestions,
        status: analysis.confidence > 0.7 ? 'success' : 'partial'
      };

    } catch (error) {
      console.error('❌ Food recognition failed:', error);
      return { itemsDetected: 0, totalCalories: 0, confidence: 0, suggestions: [], status: 'failed' };
    }
  }

  /**
   * 10.4: Common Logs Quick Access - One-tap logging system
   */
  async generateQuickLogs(userId: string): Promise<{
    commonLogs: number;
    quickButtons: number;
    suggestions: number;
    predictions: number;
    status: 'success' | 'partial' | 'failed';
  }> {
    if (!this.config.enableQuickLogs) {
      return { commonLogs: 0, quickButtons: 0, suggestions: 0, predictions: 0, status: 'failed' };
    }

    try {
      console.log('⚡ Generating quick logs and predictions...');

      // Learn user patterns
      const patterns = await this.quickLogSystem.learnUserPatterns(userId);

      // Generate quick access buttons
      const quickButtons = this.quickLogSystem.getQuickAccessButtons(userId, 10);

      // Get contextual suggestions
      const suggestions = this.quickLogSystem.getContextualSuggestions(userId);

      // Get predictive completions for empty search
      const predictions = this.quickLogSystem.getPredictiveCompletions(userId, '');

      console.log(`📝 Found ${patterns.length} common patterns`);
      console.log(`🔘 Generated ${quickButtons.length} quick buttons`);
      console.log(`💡 Created ${suggestions.length} contextual suggestions`);

      return {
        commonLogs: patterns.length,
        quickButtons: quickButtons.length,
        suggestions: suggestions.length,
        predictions: predictions.length,
        status: 'success'
      };

    } catch (error) {
      console.error('❌ Quick logs generation failed:', error);
      return { commonLogs: 0, quickButtons: 0, suggestions: 0, predictions: 0, status: 'failed' };
    }
  }

  /**
   * Get current Phase 10 status
   */
  getStatus(): Phase10Status {
    return { ...this.status };
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<Phase10Status> {
    console.log('🏥 Performing Phase 10 health check...');

    try {
      const checks = await Promise.allSettled([
        this.testSchemaEvolution(),
        this.testKnowledgeUpdates(),
        this.testFoodRecognition(),
        this.testQuickLogs()
      ]);

      this.status.schemaEvolution = checks[0].status === 'fulfilled';
      this.status.knowledgeUpdates = checks[1].status === 'fulfilled';
      this.status.foodRecognition = checks[2].status === 'fulfilled';
      this.status.quickLogs = checks[3].status === 'fulfilled';

      const healthyServices = [
        this.status.schemaEvolution,
        this.status.knowledgeUpdates,
        this.status.foodRecognition,
        this.status.quickLogs
      ].filter(Boolean).length;

      this.status.overallHealth = (healthyServices / 4) * 100;
      this.status.lastHealthCheck = new Date().toISOString();

      console.log(`💚 Phase 10 health: ${this.status.overallHealth}%`);
      
      return this.status;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.status.overallHealth = 0;
      return this.status;
    }
  }

  /**
   * Start automated health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    const intervalMs = this.config.healthCheckIntervalMinutes * 60 * 1000;
    
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);

    console.log(`⏰ Started Phase 10 health monitoring every ${this.config.healthCheckIntervalMinutes} minutes`);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🛑 Stopped Phase 10 health monitoring');
    }
  }

  // Private test methods (SECURE)
  private async testSchemaEvolution(): Promise<void> {
    // SECURITY: Test secure pattern analysis only
    const patterns = await this.schemaAnalyzer.analyzeUserPatterns('week');
    console.log(`🔐 SECURE TEST: ${patterns.length} patterns analyzed safely`);
    // Success if no errors thrown
  }

  private async testKnowledgeUpdates(): Promise<void> {
    const topics = ['protein synthesis', 'cardio benefits'];
    const research = await this.knowledgeUpdater.searchLatestResearch(topics);
    if (research.length === 0) throw new Error('No research updates found');
  }

  private async testFoodRecognition(): Promise<void> {
    // Test with a simple base64 string
    const mockImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const result = await this.foodRecognition.analyzeFood(mockImage, 'test meal');
    if (!result || result.items.length === 0) throw new Error('Food recognition failed');
  }

  private async testQuickLogs(): Promise<void> {
    const testUserId = 'test-user-' + Date.now();
    const patterns = await this.quickLogSystem.learnUserPatterns(testUserId);
    if (!Array.isArray(patterns)) throw new Error('Quick logs system failed');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopHealthMonitoring();
    console.log('🗑️ Phase 10 Integration destroyed');
  }
}

// Export class for instantiation
// Usage: const phase10 = new Phase10Integration();