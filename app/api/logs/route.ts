import { NextRequest, NextResponse } from "next/server";
import { getUserOr401 } from "@/lib/auth/getUserOr401";

export async function POST(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    const body = await req.json();
    
    // Override any client-sent user_id with authenticated user
    const payload = { 
      ...body, 
      user_id: auth.user.id,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await auth.supabase
      .from("activity_logs")
      .insert(payload)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating log:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /api/logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");
    
    let query = auth.supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (type) {
      query = query.eq("type", type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching logs:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error in GET /api/logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Remove user_id from update payload if present
    const { user_id, ...updatePayload } = body;
    
    // Update only logs belonging to the authenticated user
    const { data, error } = await auth.supabase
      .from("activity_logs")
      .update({
        ...updatePayload,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating log:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (!data) {
      return NextResponse.json(
        { error: "Log not found or unauthorized" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH /api/logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getUserOr401(req);
  if (!auth.user) return auth.res;
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }
    
    // Delete only logs belonging to the authenticated user
    const { error } = await auth.supabase
      .from("activity_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id);
    
    if (error) {
      console.error("Error deleting log:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}