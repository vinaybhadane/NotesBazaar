import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'NotesBazaar by AbhyasMitra | SPPU 2024 Pattern Engineering Notes',
  description:
    'Explore branch-wise and year-wise engineering notes for the SPPU 2024 Pattern. Find subject-wise study material, purchase securely via Razorpay, and access verified notes online.',
  keywords: [
    'SPPU 2024 Pattern notes',
    'SPPU engineering notes',
    'Pune University engineering notes',
    'Computer Engineering notes SPPU',
    'Information Technology notes SPPU',
    'Second Year engineering notes SPPU',
    'Third Year engineering notes SPPU',
    'NotesBazaar AbhyasMitra',
  ],
  authors: [{ name: 'AbhyasMitra' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'NotesBazaar by AbhyasMitra | SPPU 2024 Pattern Engineering Notes',
    description:
      'Curriculum-aligned engineering notes for SPPU 2024 Pattern. Branch-wise, year-wise, and subject-wise study material with instant digital delivery.',
    siteName: 'NotesBazaar by AbhyasMitra',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NotesBazaar by AbhyasMitra',
    description: 'SPPU 2024 Pattern Engineering Notes. High-yield, verified academic study materials.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-[#FFE500] selection:text-slate-950">
        <AuthProvider>
          {/* Announcement Bar */}
          <div className="bg-slate-950 text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse"></span>
            <span>
              SPPU 2024 Pattern Second Year & Third Year notes are now available!{' '}
              <a href="/notes" className="underline font-bold text-[#FFE500] hover:text-white transition-colors">
                Browse catalog →
              </a>
            </span>
          </div>

          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CookieBanner />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

