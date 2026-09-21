import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApplyPilot',
  description: 'AI job application agent that matches your profile against jobs, tailors applications, and tracks your pipeline with user approval.',
  openGraph: {
    title: 'ApplyPilot',
    description: 'AI job application agent that matches your profile against jobs, tailors applications, and tracks your pipeline with user approval.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
