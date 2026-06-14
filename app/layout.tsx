import type { Metadata } from "next";
import { Parkinsans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Video Manager",
  description: "Gestión de proyectos de edición de video",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${parkinsans.variable} antialiased`}>
      <body className="min-h-screen" style={{ background: "#f7f6f3", color: "#1a1916" }} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
