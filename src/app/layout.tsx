import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import Navigation from '@/components/navigation';
import { Leaf } from 'lucide-react';

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
  title: 'EcoWatch AI | AI-Powered Environmental Reporting Platform',
  description: 'Help protect the environment by reporting illegal dumping, water contamination, deforestation, and air pollution sources in real time using AI-powered analysis.',
  keywords: 'environmental watch, climate tech, pollution monitoring, illegal dumping, eco reporting, AI vision',
  openGraph: {
    title: 'EcoWatch AI - See it. Report it. Protect it.',
    description: 'AI-powered citizen platform to identify, document, and resolve environmental incidents in real time.',
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
      <body className="min-h-full flex flex-col font-sans antialiased text-foreground bg-background selection:bg-emerald-500/20 selection:text-emerald-400">
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <main className="flex-grow flex flex-col">{children}</main>
            
            {/* Global Footer */}
            <footer className="w-full py-8 mt-auto border-t border-border bg-card/35 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-sm tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-400">
                    EcoWatch AI
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center md:text-right">
                  &copy; {new Date().getFullYear()} EcoWatch AI. Designed for impact. See it. Report it. Protect it.
                </p>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
