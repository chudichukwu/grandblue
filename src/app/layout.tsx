import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Blue · Learning Sprint",
  description: "A focused six-week data-analysis learning tracker.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
