import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("activities")
    .select("*, contacts(name), deals(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, subject, contact_id, deal_id, status, scheduled_at, notes } = body;

  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      type: type || "note",
      subject,
      contact_id: contact_id || null,
      deal_id: deal_id || null,
      status: status || "pending",
      scheduled_at: scheduled_at || null,
      notes: notes || null,
    })
    .select("*, contacts(name), deals(title)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
