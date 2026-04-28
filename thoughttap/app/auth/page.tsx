"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    setLoading(true);
    setMessage("");

    const authCall = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });

    const { data, error } = await authCall;
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (mode === "signup" && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        display_name: name || email.split("@")[0],
      });
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-white/75 p-7 shadow-2xl shadow-rose-100 backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-rose-100 p-3">
            <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-rose-950">ThoughtTap</h1>
            <p className="text-sm text-rose-900/65">Sign in to your couple space</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-rose-50 p-1">
          <button onClick={() => setMode("signin")} className={`rounded-xl py-3 font-bold ${mode === "signin" ? "bg-white shadow" : "text-rose-900/60"}`}>Sign in</button>
          <button onClick={() => setMode("signup")} className={`rounded-xl py-3 font-bold ${mode === "signup" ? "bg-white shadow" : "text-rose-900/60"}`}>Create account</button>
        </div>

        {mode === "signup" && (
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-bold text-rose-950">Name</span>
            <input className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 outline-none focus:border-rose-400" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maya" />
          </label>
        )}
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-bold text-rose-950">Email</span>
          <input className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 outline-none focus:border-rose-400" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-bold text-rose-950">Password</span>
          <input type="password" className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 outline-none focus:border-rose-400" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </label>

        {message && <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
        <button disabled={loading || !email || !password} onClick={submit} className="w-full rounded-2xl bg-rose-600 px-5 py-4 font-black text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-50">
          {loading ? "Loading..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </div>
    </main>
  );
}
