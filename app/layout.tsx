import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ThoughtTap",
  description: "A meaningful tap for long-distance couples.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
