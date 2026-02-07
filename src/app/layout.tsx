import type { Metadata } from 'next';
import { Inter, Outfit, Space_Mono } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeStyleProvider } from '@/components/theme/ThemeStyleProvider';
import { UserProvider } from '@/context/UserContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ChatProvider } from '@/components/ai-chat';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit'
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono'
});

export const metadata: Metadata = {
  title: 'VantageOS | AI-Powered Business Transformation',
  description: 'Transform SOPs into AI Agents using the Lean AI methodology. VantageOS - System Operacyjny Biznesu.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${spaceMono.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeStyleProvider>
              <UserProvider>
                <ChatProvider>
                  <MainLayout>{children}</MainLayout>
                  <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                  />
                </ChatProvider>
              </UserProvider>
            </ThemeStyleProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
