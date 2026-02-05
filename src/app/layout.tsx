import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { UserProvider } from '@/context/UserContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SOP-AI | Transform SOPs into AI Agents',
  description: 'Automate the transformation of Standard Operating Procedures into AI Agents using the VantageOS methodology.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <MainLayout>{children}</MainLayout>
            <Toaster
              position="bottom-right"
              richColors
              closeButton
            />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

