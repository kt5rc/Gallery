import "./globals.css";
import { Fraunces, Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata = {
  title: "Gallery Vibe",
  description: "Local AI image gallery"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${outfit.variable} ${fraunces.variable} min-h-full bg-ink text-mist antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
