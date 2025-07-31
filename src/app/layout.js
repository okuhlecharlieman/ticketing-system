import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from '../context/DarkModeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ticketing System",
  description: "A modern ticketing system built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <DarkModeProvider>
            <ServiceWorkerRegistration />
            {children}
          </DarkModeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}