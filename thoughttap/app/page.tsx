import Link from "next/link";
import { Heart, Bell, Lock, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
          <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
          ThoughtTap
        </div>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight text-rose-950 md:text-7xl">
          One tiny tap. One big reminder.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-rose-900/75 md:text-xl">
          A private button for couples. Send a simple “I remembered you” notification with a thoughtful daily limit.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/auth" className="rounded-2xl bg-rose-600 px-7 py-4 font-bold text-white shadow-xl shadow-rose-200 transition hover:bg-rose-700">
            Start tapping
          </Link>
          <a href="#how" className="rounded-2xl bg-white/75 px-7 py-4 font-bold text-rose-900 shadow-sm backdrop-blur transition hover:bg-white">
            How it works
          </a>
        </div>

        <div id="how" className="mt-16 grid w-full gap-4 md:grid-cols-3">
          {[
            { icon: Lock, title: "Pair privately", text: "Create a couple invite link and share it with your partner." },
            { icon: Bell, title: "Tap with care", text: "Each person gets five taps per rolling 24 hours." },
            { icon: Sparkles, title: "Feel remembered", text: "Your partner sees the tap instantly in their ThoughtTap app." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-white/70 p-6 text-left shadow-lg shadow-rose-100/60 backdrop-blur">
              <item.icon className="mb-4 h-8 w-8 text-rose-500" />
              <h3 className="text-xl font-extrabold text-rose-950">{item.title}</h3>
              <p className="mt-2 text-rose-900/70">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
