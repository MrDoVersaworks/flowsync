import './globals.css';
import Script from 'next/script';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  let settings: any = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      settings = json.data;
    }
  } catch (e) {
    console.warn('Failed to fetch global settings for scripts');
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {settings?.termly_uuid && (
          <script
            type="text/javascript"
            src="https://app.termly.io/embed.min.js"
            data-auto-block="on"
            data-website-uuid={settings.termly_uuid}
          ></script>
        )}
        {settings?.google_analytics_id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.google_analytics_id}');
              `}
            </Script>
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) { console.error('Theme hydration failed:', e); }
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
