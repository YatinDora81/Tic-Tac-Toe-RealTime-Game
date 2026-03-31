import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "../providers/app-providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Tic-Tac-Toe | Multiplayer",
  description: "Real-time multiplayer Tic-Tac-Toe with matchmaking, leaderboards, and timed mode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} text-white min-h-screen antialiased`}>
        <div className="bg-mesh" />
        <div className="bg-orb-3" />
        <AppProviders>
          <div className="relative z-10">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
