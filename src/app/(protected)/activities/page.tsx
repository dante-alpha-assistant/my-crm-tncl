import { createClient } from "@/lib/supabase/server";
import { ActivitiesClient } from "./ActivitiesClient";

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  contact_id: string | null;
  deal_id: string | null;
  status: string;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
  contacts?: { name: string } | null;
  deals?: { title: string } | null;
}

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activities: Activity[] = [];
  let contacts: { id: string; name: string }[] = [];
  let deals: { id: string; title: string }[] = [];

  if (user) {
    const { data: activitiesData } = await supabase
      .from("activities")
      .select("*, contacts(name), deals(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    activities = (activitiesData ?? []) as Activity[];

    const { data: contactsData } = await supabase
      .from("contacts")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");
    contacts = (contactsData ?? []) as { id: string; name: string }[];

    const { data: dealsData } = await supabase
      .from("deals")
      .select("id, title")
      .eq("user_id", user.id)
      .order("title");
    deals = (dealsData ?? []) as { id: string; title: string }[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground">Track your tasks and communications.</p>
      </div>
      <ActivitiesClient initialActivities={activities} contacts={contacts} deals={deals} />
    </div>
  );
}
