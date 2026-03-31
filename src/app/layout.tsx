import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/app/sw-register";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#111827",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: {
    default: "Traction Royale",
    template: "%s | Traction Royale",
  },
  description:
    "Know the moment someone signs up. One line of code, push notifications on your phone.",
  metadataBase: new URL("https://royale-indol.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full scroll-smooth bg-[var(--surface-0)] text-[var(--ink-1)] antialiased`}
    >
      <body className="min-h-full bg-[var(--surface-0)] text-[var(--ink-1)]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
