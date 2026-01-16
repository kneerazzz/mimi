import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/parts/Header";
import LoginModal from "@/components/auth/LoginModal";
import Footer from "@/components/parts/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mimi",
  description: "Goated shii",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
        className="dark"
      >
        <AuthProvider>
            <Navbar />
            <Toaster richColors position="top-right" />
            {children}
            <LoginModal />
            <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
