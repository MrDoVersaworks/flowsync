import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import ThemeProvider from '@/components/shared/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

import PageTransition from '@/components/layout/PageTransition';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlowSync | Sovereign AI Workflow Orchestration',
  description: 'Manage your workspaces, kanban boards, and AI breakdowns with absolute sovereignty.',
  keywords: ['AI orchestration', 'kanban', 'sovereign workspace', 'workflow management', 'productivity'],
  authors: [{ name: 'Oyewole Favour' }],
  openGraph: {
    title: 'FlowSync | Sovereign AI Workflow Orchestration',
    description: 'Manage your workspaces, kanban boards, and AI breakdowns with absolute sovereignty.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-primary text-primary antialiased`}>
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 overflow-x-hidden pt-16">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-sec)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-col)',
                  backdropFilter: 'blur(10px)',
                },
              }}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
