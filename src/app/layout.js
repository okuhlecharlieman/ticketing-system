import { Inter } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from '../context/DarkModeContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Ticketing System",
  description: "A modern ticketing system built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
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