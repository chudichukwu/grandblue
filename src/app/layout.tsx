import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Blue · Learning Sprint",
  description: "A focused six-week data-analysis learning tracker.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><ToastProvider><AppShell>{children}</AppShell></ToastProvider></body>
    </html>
  );
}
