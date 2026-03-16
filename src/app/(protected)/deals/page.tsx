import { createClient } from "@/lib/supabase/server";
import { DealsClient } from "./DealsClient";

export interface Deal {
  id: string;
  user_id: string;
  title: string;
  contact_id: string | null;
  value: number;
  stage: string;
  notes: string | null;
  created_at: string;
  contacts?: { name: string } | null;
}

export default async function DealsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let deals: Deal[] = [];
  let contacts: { id: string; name: string }[] = [];

  if (user) {
    const { data: dealsData } = await supabase
      .from("deals")
      .select("*, contacts(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    deals = (dealsData ?? []) as Deal[];

    const { data: contactsData } = await supabase
      .from("contacts")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");
    contacts = (contactsData ?? []) as { id: string; name: string }[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
        <p className="text-muted-foreground">Track your sales pipeline.</p>
      </div>
      <DealsClient initialDeals={deals} contacts={contacts} />
    </div>
  );
}
