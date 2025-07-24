import { AuthProvider } from '../context/AuthContext';  // Correct path
import { ThemeProvider } from '../context/ThemeContext';  // Correct path
import Navbar from '../components/Navbar';  // Correct path
import '../styles/globals.css';  // Correct relative path (from /app/ to /styles/)

export const metadata = {
  title: 'Ticketing System',
  description: 'Efficient ticket management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="container mx-auto p-4">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}