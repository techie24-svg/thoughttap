"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Copy, Heart, LogOut, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Couple, Profile, ThoughtTap } from "@/lib/types";

const DAILY_LIMIT = 5;

export default function AppShell() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [taps, setTaps] = useState<ThoughtTap[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [browserNotify, setBrowserNotify] = useState(false);

  const since = useMemo(() => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), []);
  const sentIn24h = taps.filter((tap) => tap.sender_id === profile?.id && new Date(tap.created_at) >= new Date(since)).length;
  const remaining = Math.max((couple?.daily_limit || DAILY_LIMIT) - sentIn24h, 0);
  const partnerId = couple?.user_a === profile?.id ? couple?.user_b : couple?.user_a;
  const received = taps.filter((tap) => tap.receiver_id === profile?.id);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!couple?.id) return;
    const channel = supabase
      .channel(`thought-taps-${couple.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "thought_taps", filter: `couple_id=eq.${couple.id}` },
        (payload) => {
          const tap = payload.new as ThoughtTap;
          setTaps((current) => [tap, ...current]);
          if (tap.receiver_id === profile?.id && browserNotify && "Notification" in window && Notification.permission === "granted") {
            new Notification("ThoughtTap ❤️", { body: "Your person remembered you." });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id, profile?.id, browserNotify]);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/auth");
      return;
    }

    let { data: profileData } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
    if (!profileData) {
      await supabase.from("profiles").insert({ id: auth.user.id, email: auth.user.email, display_name: auth.user.email?.split("@")[0] });
      const retry = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
      profileData = retry.data;
    }
    setProfile(profileData as Profile);

    if (profileData?.couple_id) {
      const { data: coupleData } = await supabase.from("couples").select("*").eq("id", profileData.couple_id).single();
      setCouple(coupleData as Couple);
      const { data: tapData } = await supabase
        .from("thought_taps")
        .select("*")
        .eq("couple_id", profileData.couple_id)
        .order("created_at", { ascending: false })
        .limit(50);
      setTaps((tapData || []) as ThoughtTap[]);
    }
    setLoading(false);
  }

  async function createCouple() {
    if (!profile) return;
    setMessage("");
    const inviteCode = crypto.randomUUID().slice(0, 8);
    const { data, error } = await supabase
      .from("couples")
      .insert({ user_a: profile.id, invite_code: inviteCode, daily_limit: DAILY_LIMIT })
      .select()
      .single();

    if (error) return setMessage(error.message);
    await supabase.from("profiles").update({ couple_id: data.id }).eq("id", profile.id);
    setCouple(data as Couple);
    setProfile({ ...profile, couple_id: data.id });
  }

  async function sendTap() {
    if (!profile || !couple || !partnerId) return;
    setMessage("");
    if (remaining <= 0) return setMessage("You used all your ThoughtTaps for this 24-hour window ❤️");

    const { error } = await supabase.from("thought_taps").insert({
      couple_id: couple.id,
      sender_id: profile.id,
      receiver_id: partnerId,
      message: "remembered you",
    });
    if (error) setMessage(error.message);
  }

  async function enableNotifications() {
    if (!("Notification" in window)) return setMessage("This browser does not support notifications.");
    const permission = await Notification.requestPermission();
    setBrowserNotify(permission === "granted");
    setMessage(permission === "granted" ? "Browser notifications enabled on this device." : "Notifications were not enabled.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center text-rose-950">Loading ThoughtTap...</main>;

  if (!couple) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="max-w-lg rounded-[2rem] bg-white/75 p-7 text-center shadow-2xl shadow-rose-100 backdrop-blur">
          <Heart className="mx-auto mb-4 h-12 w-12 fill-rose-500 text-rose-500" />
          <h1 className="text-3xl font-black text-rose-950">Create your couple space</h1>
          <p className="mt-3 text-rose-900/70">Start a private ThoughtTap room, then share your invite link with your partner.</p>
          {message && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
          <button onClick={createCouple} className="mt-6 w-full rounded-2xl bg-rose-600 px-5 py-4 font-black text-white shadow-lg shadow-rose-200 hover:bg-rose-700">
            Create invite link
          </button>
          <button onClick={signOut} className="mt-3 text-sm font-bold text-rose-700">Sign out</button>
        </div>
      </main>
    );
  }

  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/invite/${couple.invite_code}` : "";

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/70 p-3 shadow-sm"><Heart className="h-6 w-6 fill-rose-500 text-rose-500" /></div>
            <div><h1 className="text-2xl font-black text-rose-950">ThoughtTap</h1><p className="text-sm text-rose-900/60">Hi, {profile?.display_name || "love"}</p></div>
          </div>
          <button onClick={signOut} className="rounded-2xl bg-white/70 p-3 text-rose-700 shadow-sm"><LogOut className="h-5 w-5" /></button>
        </header>

        {!couple.user_b && (
          <section className="mb-6 rounded-[2rem] bg-white/75 p-6 shadow-xl shadow-rose-100 backdrop-blur">
            <h2 className="text-xl font-black text-rose-950">Invite your partner</h2>
            <p className="mt-2 text-rose-900/70">Share this link. After they join, the button becomes active.</p>
            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-rose-50 p-3 sm:flex-row sm:items-center">
              <code className="flex-1 overflow-auto text-sm text-rose-900">{inviteUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(inviteUrl)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-rose-700 shadow-sm"><Copy className="h-4 w-4" /> Copy</button>
            </div>
          </section>
        )}

        <section className="rounded-[2.5rem] bg-white/75 p-8 text-center shadow-2xl shadow-rose-100 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-500">{remaining} of {couple.daily_limit} taps left</p>
          <button disabled={!couple.user_b || remaining <= 0} onClick={sendTap} className="mx-auto my-8 flex h-56 w-56 items-center justify-center rounded-full bg-rose-600 text-white shadow-2xl shadow-rose-300 transition hover:scale-105 hover:bg-rose-700 disabled:scale-100 disabled:bg-rose-300">
            <span className="flex flex-col items-center gap-3 text-2xl font-black"><Heart className="h-16 w-16 fill-white" /> Tap</span>
          </button>
          <p className="text-rose-900/70">{couple.user_b ? "Send a quiet reminder that they crossed your mind." : "Waiting for your partner to join."}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={enableNotifications} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 font-bold text-rose-700"><Bell className="h-4 w-4" /> Enable notifications</button>
            <button onClick={() => navigator.share?.({ title: "ThoughtTap", url: inviteUrl })} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 font-bold text-rose-700"><Share2 className="h-4 w-4" /> Share invite</button>
          </div>
          {message && <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
        </section>

        <section className="mt-6 rounded-[2rem] bg-white/65 p-6 shadow-lg shadow-rose-100/70 backdrop-blur">
          <h2 className="text-xl font-black text-rose-950">Recent moments</h2>
          <div className="mt-4 space-y-3">
            {taps.length === 0 && <p className="text-rose-900/60">No taps yet.</p>}
            {taps.map((tap) => (
              <div key={tap.id} className="rounded-2xl bg-white/70 p-4 text-sm text-rose-900 shadow-sm">
                {tap.sender_id === profile?.id ? "You remembered your partner" : "Your partner remembered you"} · {new Date(tap.created_at).toLocaleString()}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
