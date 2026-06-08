import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import Navigation from '@/components/navigation';
import { Brain } from 'lucide-react';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TerraMind AI | AI-Powered Environmental Intelligence Network',
  description: 'Reconciling citizen oversight with professional response networks. TerraMind AI uses Gemini Vision diagnostics and geospatial intelligence to identify, track, and remediate ecological hazards.',
  keywords: 'environmental intelligence, climate tech, green monitoring, predictive analytics, decision support systems, Palantir climate',
  openGraph: {
    title: 'TerraMind AI - Environmental Intelligence Network',
    description: 'Transform environmental reporting into actionable intelligence through AI, geospatial analytics, and community-driven monitoring.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased text-foreground bg-background selection:bg-cyan-500/20 selection:text-cyan-400">
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <main className="flex-grow flex flex-col">{children}</main>
            
            {/* SaaS Footer */}
            <footer className="w-full py-10 mt-auto border-t border-border bg-[#0b101c]/60 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-sm tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">
                    TERRAMIND AI
                  </span>
                </div>
                <div className="flex gap-6 text-xs text-muted-foreground">
                  <span className="hover:text-foreground cursor-pointer">Security Protocol</span>
                  <span className="hover:text-foreground cursor-pointer">API Integration</span>
                  <span className="hover:text-foreground cursor-pointer">DSOC Summer 2026</span>
                </div>
                <p className="text-xs text-muted-foreground text-center md:text-right">
                  &copy; {new Date().getFullYear()} TerraMind AI. Built for Dev Season of Code.
                </p>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
