import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from '@/lib/utils';

const geistSans = GeistSans;

export const metadata: Metadata = {
  title: 'TypeMaster Challenge',
  description: 'Train your typing speed with TypeMaster Challenge!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        geistSans.variable, 

        "font-sans antialiased"
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <div className="absolute top-4 right-4 z-50">
              <ThemeToggle />
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
