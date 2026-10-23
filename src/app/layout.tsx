import React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/tailwind.css";
import ScrollIndicator from "@/components/ScrollIndicator";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "UniTrack — University & Course Discovery Platform",
  description:
    "UniTrack helps students find universities and courses while giving admins powerful tools to manage listings and track enrollment trends.",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        {/* Material Symbols is an icon font that next/font does not support. */}
        {/* react-doctor-disable-next-line react-doctor/nextjs-no-font-link */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ScrollIndicator />
      </body>
    </html>
  );
}
