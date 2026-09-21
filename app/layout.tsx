import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareerPilot AI — Personal AI Job-Search Agent',
  description: 'Your AI career agent works every day to find the right jobs before they disappear. Discovers newly posted relevant jobs, evaluates them with transparent evidence, prepares tailored applications, and tracks outcomes.',
  openGraph: {
    title: 'CareerPilot AI — Personal AI Job-Search Agent',
    description: 'Your AI career agent works every day to find the right jobs before they disappear.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased" suppressHydrationWarning>
      <body 
        className="min-h-full flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
