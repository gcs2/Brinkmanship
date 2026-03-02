import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRINKMANSHIP | Sovereign Engine",
  description: "Functional Geopolitical Strategy Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-background text-foreground`}>
        {/* Global Film Grain Noise Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Subtle Vignette */}
        <div className="pointer-events-none fixed inset-0 z-40 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
