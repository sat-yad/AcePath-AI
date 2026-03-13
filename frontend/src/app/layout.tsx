import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'AcePath AI — Autonomous Interview & Career Coach',
  description: 'Personalized interview preparation, adaptive roadmaps, and AI mock interviews for elite tech careers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-slate-200 selection:bg-indigo-500/30`} suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="relative min-h-screen overflow-hidden">
            {/* Background elements */}
            <div className="fixed top-0 -left-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
            <div className="fixed bottom-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10" />
            
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
