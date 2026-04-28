"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function InvitePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const [status, setStatus] = useState("Joining your couple space...");

  useEffect(() => {
    join();
  }, []);

  async function join() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push(`/auth?next=/invite/${params.code}`);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
    if (!profile) {
      await supabase.from("profiles").insert({ id: auth.user.id, email: auth.user.email, display_name: auth.user.email?.split("@")[0] });
    }

    const { data: couple, error } = await supabase.from("couples").select("*").eq("invite_code", params.code).single();
    if (error || !couple) {
      setStatus("Invite not found.");
      return;
    }
    if (couple.user_a === auth.user.id) {
      router.push("/app");
      return;
    }
    if (couple.user_b && couple.user_b !== auth.user.id) {
      setStatus("This ThoughtTap invite has already been used.");
      return;
    }

    await supabase.from("couples").update({ user_b: auth.user.id }).eq("id", couple.id);
    await supabase.from("profiles").update({ couple_id: couple.id }).eq("id", auth.user.id);
    router.push("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="rounded-[2rem] bg-white/75 p-8 text-center shadow-2xl shadow-rose-100 backdrop-blur">
        <Heart className="mx-auto mb-4 h-12 w-12 fill-rose-500 text-rose-500" />
        <h1 className="text-2xl font-black text-rose-950">ThoughtTap Invite</h1>
        <p className="mt-3 text-rose-900/70">{status}</p>
      </div>
    </main>
  );
}
