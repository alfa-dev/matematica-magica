import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-ceu text-tinta">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-tinta px-6 py-4 text-white">
        <Link href="/admin" className="font-display text-xl font-bold">
          🛠️ Painel Admin
        </Link>
        <nav className="flex items-center gap-4 font-body text-sm font-bold">
          <Link href="/admin" className="opacity-80 hover:opacity-100">
            Visão geral
          </Link>
          <Link href="/jogar" className="opacity-80 hover:opacity-100">
            Voltar ao jogo
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
