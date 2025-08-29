import { NextRequest, NextResponse } from "next/server";
import { getUserOr401 } from "@/lib/auth/getUserOr401";

export async function GET(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "week";
    
    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Fetch user-specific dashboard data
    const [
      workoutsResult,
      nutritionResult,
      weightResult,
      insightsResult
    ] = await Promise.all([
      // Workouts
      auth.supabase
        .from("workouts")
        .select("*")
        .eq("user_id", auth.user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false }),
      
      // Nutrition logs
      auth.supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", auth.user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false }),
      
      // Weight entries
      auth.supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", auth.user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false }),
      
      // Insights
      auth.supabase
        .from("insights")
        .select("*")
        .eq("user_id", auth.user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(5)
    ]);
    
    // Calculate summary statistics
    const workouts = workoutsResult.data || [];
    const nutrition = nutritionResult.data || [];
    const weights = weightResult.data || [];
    const insights = insightsResult.data || [];
    
    const dashboardData = {
      summary: {
        totalWorkouts: workouts.length,
        totalCaloriesLogged: nutrition.reduce((sum, log) => sum + (log.calories || 0), 0),
        totalProteinLogged: nutrition.reduce((sum, log) => sum + (log.protein || 0), 0),
        currentWeight: weights.length > 0 ? weights[0].weight : null,
        weightChange: weights.length > 1 ? weights[0].weight - weights[weights.length - 1].weight : 0,
        lastWorkout: workouts.length > 0 ? workouts[0].created_at : null,
        lastFoodLog: nutrition.length > 0 ? nutrition[0].created_at : null,
        timeRange
      },
      recentWorkouts: workouts.slice(0, 5),
      recentNutrition: nutrition.slice(0, 5),
      weightHistory: weights,
      insights: insights,
      userId: auth.user.id
    };
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    const body = await req.json();
    const { type, ...data } = body;
    
    if (!type) {
      return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }
    
    let result;
    
    // Route to appropriate table based on type
    switch (type) {
      case "workout":
        result = await auth.supabase
          .from("workouts")
          .insert({
            ...data,
            user_id: auth.user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        break;
        
      case "nutrition":
        result = await auth.supabase
          .from("food_logs")
          .insert({
            ...data,
            user_id: auth.user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        break;
        
      case "weight":
        result = await auth.supabase
          .from("weight_entries")
          .insert({
            ...data,
            user_id: auth.user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }
    
    if (result.error) {
      console.error(`Error creating ${type}:`, result.error);
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in POST /api/dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}