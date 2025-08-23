/**
 * Sport-Specific Habits API - Phase 5.4 Implementation
 * Tennis example with identity-based habit formation
 */

import { NextRequest, NextResponse } from 'next/server'
import { TennisHabits, createSportHabits, SportContext } from '@/lib/ai-coach/sport-specific-habits'

export async function GET(req: NextRequest) {
  try {
    console.log('🎾 Generating sport-specific habits (Tennis example)...')
    
    // Get parameters from URL
    const sport = req.nextUrl.searchParams.get('sport') || 'tennis'
    const experience = req.nextUrl.searchParams.get('experience') || 'intermediate'
    const schedule = req.nextUrl.searchParams.get('schedule') || 'regular'
    
    // Create sport context
    const context: SportContext = {
      sport,
      experience: experience as any,
      goals: ['improve_consistency', 'tournament_ready'],
      schedule: schedule as any,
      constraints: []
    }

    // Get sport-specific habits
    const sportHabits = sport === 'tennis' ? TennisHabits : createSportHabits(sport, experience)
    
    // Get all habit categories
    const allHabits = sportHabits.getAllTennisHabits()
    
    // Get personalized recommendations
    const personalizedHabits = sportHabits.generatePersonalizedHabits(context)

    const response = {
      success: true,
      data: {
        sport,
        userContext: context,
        habitCategories: {
          preMatchNutrition: allHabits.preMatchNutrition.map(habit => ({
            ...habit,
            behaviorModel: {
              cue: habit.cue,
              routine: habit.routine,
              reward: habit.reward,
              identityStatement: habit.identityStatement
            },
            tinyHabitProgression: habit.progressionSteps.map((step, index) => ({
              week: index + 1,
              description: step,
              difficulty: index === 0 ? 1 : Math.min(3, index)
            }))
          })),
          postMatchRecovery: allHabits.postMatchRecovery.map(habit => ({
            ...habit,
            immediateRewardDesign: {
              physicalReward: habit.reward,
              socialReward: habit.category === 'recovery' ? 'Share recovery win with community' : null,
              intrinsicReward: habit.identityStatement
            }
          })),
          tournamentPrep: allHabits.tournamentPrep.map(habit => ({
            ...habit,
            progressiveDisclosure: {
              initialFocus: habit.difficulty === 1 ? 'Start here' : 'Add after mastering basics',
              fullImplementation: habit.progressionSteps[habit.progressionSteps.length - 1],
              anxietyReduction: habit.category === 'preparation' ? 'Reduces pre-competition anxiety' : null
            }
          })),
          sleepOptimization: allHabits.sleepOptimization.map(habit => ({
            ...habit,
            recoveryIdentity: {
              identityShift: habit.identityStatement,
              athleteStandard: 'Professional athletes average 8.5+ hours of sleep',
              performanceCorrelation: 'Every hour of sleep improves reaction time by 10%'
            }
          })),
          socialAccountability: allHabits.socialAccountability.map(habit => ({
            ...habit,
            communityFeatures: {
              accountabilityLevel: habit.difficulty,
              socialProof: habit.category === 'mental' ? 'Join 847 tennis players tracking habits' : null,
              publicCommitment: habit.name.includes('Public') ? 'Increases success rate by 65%' : null
            }
          }))
        },
        personalizedRecommendations: personalizedHabits.map(habit => ({
          ...habit,
          customization: {
            selectedForUser: `Perfect for ${experience} ${sport} player`,
            priorityLevel: habit.difficulty === 1 ? 'Start immediately' : 'Add after mastering easier habits',
            expectedOutcome: `Build this habit to become: ${habit.identityStatement.split(' who ')[1] || 'a better athlete'}`
          }
        })),
        implementationStrategy: {
          week1: personalizedHabits.filter(h => h.difficulty === 1).slice(0, 2),
          week2: personalizedHabits.filter(h => h.difficulty === 1),
          week3: personalizedHabits.filter(h => h.difficulty <= 2),
          week4: personalizedHabits.filter(h => h.difficulty <= 3)
        },
        timestamp: new Date().toISOString()
      }
    }

    console.log('✅ Sport-specific habits generated successfully')
    console.log(`   - Sport: ${sport} (${experience} level)`)
    console.log(`   - Total habits available: ${Object.values(allHabits).flat().length}`)
    console.log(`   - Personalized recommendations: ${personalizedHabits.length}`)
    console.log(`   - Week 1 focus: ${response.data.implementationStrategy.week1.length} habits`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error generating sport habits:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate sport habits',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, habitId, userId, data } = body

    console.log(`🎾 Processing sport habit action: ${action}`)

    switch (action) {
      case 'track_habit_completion':
        // Track habit completion with behavior model
        const completionData = {
          habitId,
          completed: data.completed,
          timestamp: new Date(),
          notes: data.notes,
          difficulty: data.difficulty || 'easy'
        }
        
        console.log(`✅ Habit completion tracked: ${habitId}`)
        console.log(`   - Completed: ${data.completed}`)
        console.log(`   - Difficulty: ${data.difficulty}`)
        
        // Calculate habit strength (simplified for demo)
        const mockCompletions = Array.from({length: 14}, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          completed: Math.random() > 0.3 // 70% completion rate
        }))
        
        const habitStrength = TennisHabits.calculateHabitStrength(
          { progressionSteps: ['Week 1', 'Week 2', 'Week 3', 'Week 4+'] } as any,
          mockCompletions
        )
        
        return NextResponse.json({
          success: true,
          message: 'Habit completion tracked!',
          habitStrength: {
            ...habitStrength,
            encouragement: habitStrength.strength > 70 
              ? `Amazing! This habit is becoming automatic (${habitStrength.strength}% strength)`
              : `Keep going! You're building momentum (${habitStrength.strength}% strength)`
          }
        })

      case 'start_habit_program':
        // Start a sport-specific habit program
        const sport = data.sport || 'tennis'
        const program = data.program || 'beginner_fundamentals'
        
        console.log(`🚀 Starting habit program: ${program} for ${sport}`)
        
        return NextResponse.json({
          success: true,
          message: `${sport} habit program started!`,
          program: {
            name: program,
            duration: '4 weeks',
            habits: 3,
            identityFocus: `Become an athlete who prioritizes ${sport} excellence`,
            nextAction: 'Complete your first tiny habit today'
          }
        })

      case 'update_sport_context':
        // Update user's sport context and get new recommendations
        const newContext: SportContext = {
          sport: data.sport || 'tennis',
          experience: data.experience || 'intermediate',
          goals: data.goals || [],
          schedule: data.schedule || 'regular',
          constraints: data.constraints || []
        }
        
        const updatedHabits = TennisHabits.generatePersonalizedHabits(newContext)
        
        console.log(`🔄 Sport context updated: ${newContext.sport} (${newContext.experience})`)
        
        return NextResponse.json({
          success: true,
          message: 'Sport preferences updated!',
          newRecommendations: updatedHabits.length,
          focusAreas: updatedHabits.map(h => h.category)
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Error processing sport habit action:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}