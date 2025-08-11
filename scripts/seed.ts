import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service, { auth: { persistSession: false } });

  const email = "demo@fit.ai";
  const password = "Demo123!";
  const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userErr) throw userErr;
  const user = userData.user!;
  console.log("Created user:", user.email);

  const { error: profErr } = await supabase.from("profiles").insert({
    id: user.id,
    locale: "en",
    units_weight: "kg",
    units_distance: "km",
    goal_type: "weight_loss",
    experience: "intermediate",
    constraints_json: {},
  });
  if (profErr) throw profErr;

  const { error: bodyErr } = await supabase.from("body_metrics").insert([
    { user_id: user.id, measured_at: new Date().toISOString(), weight_kg: 83.5 }
  ]);
  if (bodyErr) throw bodyErr;

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
