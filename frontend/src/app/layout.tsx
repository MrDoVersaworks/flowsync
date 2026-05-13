import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FlowSync | Sovereign AI Workflow Orchestration',
  description: 'Manage your workspaces, kanban boards, and AI breakdowns with absolute sovereignty.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-primary text-primary antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 overflow-x-hidden pt-16">
            {children}
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0d1117',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
