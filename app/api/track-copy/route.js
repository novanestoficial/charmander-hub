import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  await supabase.rpc("log_script_copy");
  return NextResponse.json({ ok: true });
}
