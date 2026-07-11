import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matemática Mágica",
  description: "Uma aventura de matemática para crianças",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ceu font-body text-tinta antialiased">{children}</body>
    </html>
  );
}
