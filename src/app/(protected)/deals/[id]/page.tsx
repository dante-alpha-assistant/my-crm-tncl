import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const stageBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  lead: "secondary",
  qualified: "outline",
  proposal: "default",
  "closed-won": "default",
  "closed-lost": "destructive",
};

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: deal } = await supabase
    .from("deals")
    .select("*, contacts(name, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!deal) notFound();

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("deal_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/deals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{deal.title}</h1>
          <Badge variant={stageBadge[deal.stage] ?? "outline"}>{deal.stage}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Value</p>
            <p className="font-medium text-lg">${Number(deal.value).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stage</p>
            <p className="font-medium capitalize">{deal.stage}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contact</p>
            {deal.contacts ? (
              <Link href={`/contacts/${deal.contact_id}`} className="font-medium text-primary hover:underline">
                {deal.contacts.name}
              </Link>
            ) : (
              <p className="font-medium">—</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{new Date(deal.created_at).toLocaleDateString()}</p>
          </div>
          {deal.notes && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{act.subject}</p>
                  <p className="text-xs text-muted-foreground capitalize">{act.type}</p>
                </div>
                <Badge variant={act.status === "done" ? "default" : "secondary"}>{act.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
