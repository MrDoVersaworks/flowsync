import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowSync | Real-Time Sovereign Kanban',
  description: 'Production-grade collaborative task management with user-defined AI sovereignty.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0a0a0a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
            },
          }}
        />
      </body>
    </html>
  );
}
