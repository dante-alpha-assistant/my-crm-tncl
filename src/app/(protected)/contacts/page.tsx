import { createClient } from "@/lib/supabase/server";
import { ContactsClient } from "./ContactsClient";

export default async function ContactsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let contacts: Contact[] = [];
  if (user) {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    contacts = (data ?? []) as Contact[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">Manage your contacts.</p>
      </div>
      <ContactsClient initialContacts={contacts} />
    </div>
  );
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
}
