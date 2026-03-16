import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Activity, DollarSign } from "lucide-react";

async function getStats() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { contacts: 0, activeDeals: 0, openActivities: 0, totalDealValue: 0 };

    const [contactsRes, dealsRes, activitiesRes, dealValueRes] = await Promise.all([
      supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("deals").select("id", { count: "exact", head: true }).eq("user_id", user.id).neq("stage", "closed-lost"),
      supabase.from("activities").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
      supabase.from("deals").select("value").eq("user_id", user.id),
    ]);

    const totalDealValue = (dealValueRes.data ?? []).reduce(
      (sum: number, d: { value: number }) => sum + (Number(d.value) || 0),
      0
    );

    return {
      contacts: contactsRes.count ?? 0,
      activeDeals: dealsRes.count ?? 0,
      openActivities: activitiesRes.count ?? 0,
      totalDealValue,
    };
  } catch {
    return { contacts: 0, activeDeals: 0, openActivities: 0, totalDealValue: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Total Contacts",
      value: stats.contacts,
      icon: Users,
      description: "All contacts in your CRM",
    },
    {
      title: "Active Deals",
      value: stats.activeDeals,
      icon: Briefcase,
      description: "Deals not yet closed-lost",
    },
    {
      title: "Open Activities",
      value: stats.openActivities,
      icon: Activity,
      description: "Pending tasks & activities",
    },
    {
      title: "Total Deal Value",
      value: `$${stats.totalDealValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Sum of all deal values",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your CRM at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
