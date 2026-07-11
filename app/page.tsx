"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Mascot from "@/components/Mascot";

export default function Home() {
  const [carregando, setCarregando] = useState(false);

  async function entrarComGoogle() {
    setCarregando(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center text-center">
        <Mascot humor="comemorando" size={150} />
        <h1 className="mt-4 font-display text-5xl font-bold text-tinta">
          Matemática <span className="text-coral">Mágica</span>
        </h1>
        <p className="mt-2 max-w-xs font-body text-lg font-semibold text-tinta/70">
          Uma aventura pelos números com o Pip! Somas, tabuadas, minigames e muitos prêmios. ✨
        </p>
      </div>

      <button
        onClick={entrarComGoogle}
        disabled={carregando}
        className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-display text-xl font-bold text-tinta shadow-candy transition active:translate-y-1 active:shadow-candyPressed disabled:opacity-60"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.6-.2-2.3H12v4.5h6.5c-.2 1.5-1.1 3.7-3.2 5.2l4.9 3.8c2.9-2.7 4.6-6.6 4.6-11.2z" />
          <path fill="#34A853" d="M12 24c4.1 0 7.5-1.3 10-3.6l-4.9-3.8c-1.3.9-3 1.5-5.1 1.5-3.9 0-7.2-2.6-8.4-6.1L.9 15.9C3.4 20.7 7.4 24 12 24z" />
          <path fill="#FBBC05" d="M3.6 12c0-1 .2-1.9.5-2.8L1 5.3C.4 7.3 0 9.6 0 12s.4 4.7 1 6.7l3.1-3.9c-.3-.9-.5-1.8-.5-2.8z" />
          <path fill="#EA4335" d="M12 4.7c2.2 0 3.7.9 4.6 1.7l4.3-4.2C18.4.9 15.4 0 12 0 7.4 0 3.4 3.3.9 8.1L4 12c1.2-3.5 4.5-6.1 8-7.3z" />
        </svg>
        {carregando ? "Abrindo..." : "Entrar com Google"}
      </button>

      <p className="max-w-xs text-center font-body text-sm text-tinta/50">
        Use a conta Google da família. Dentro do jogo, a criança escolhe o próprio nome de aventureira!
      </p>
    </main>
  );
}
