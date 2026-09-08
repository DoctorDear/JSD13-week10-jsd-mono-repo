import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function connectSupabase() {
  try {
    supabase.from("users").select("id").limit(1);
  } catch (error) {
    console.error("Supabase connection error ❌", error);
    throw error;
  }
}
