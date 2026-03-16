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

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!contact) notFound();

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("contact_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("contact_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const stageColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    lead: "secondary",
    qualified: "default",
    proposal: "default",
    "closed-won": "default",
    "closed-lost": "destructive",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{contact.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{contact.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{contact.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Company</p>
            <p className="font-medium">{contact.company ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{new Date(contact.created_at).toLocaleDateString()}</p>
          </div>
          {contact.notes && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {deals && deals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <span className="font-medium">{deal.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">${Number(deal.value).toLocaleString()}</span>
                  <Badge variant={stageColor[deal.stage] ?? "outline"}>{deal.stage}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
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
