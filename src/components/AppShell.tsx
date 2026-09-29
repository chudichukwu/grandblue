"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ProgressProvider } from "@/components/ProgressProvider";
import { LocalDataImport } from "@/components/LocalDataImport";
import { LearningProvider } from "@/components/LearningProvider";
import { signOut } from "@/app/auth/actions";
import styles from "./AppShell.module.css";

const navigation = [
  { href: "/", label: "Dashboard", icon: "01" },
  { href: "/check-in", label: "Daily check-in", icon: "02" },
  { href: "/plan", label: "Six-week plan", icon: "03" },
  { href: "/history", label: "History", icon: "04" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("grand-blue.theme");
        if (stored === "light" || stored === "dark") setTheme(stored);
      } catch (error) {
        console.warn("Theme preference could not be read.", error);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("grand-blue.theme", theme);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }
  }, [theme]);

  if (pathname.startsWith("/auth/")) return <>{children}</>;

  return (
    <ProgressProvider><LearningProvider>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Link href="/" className={styles.brand} aria-label="Grand Blue dashboard">
            <span className={styles.mark}>GB</span>
            <span><strong>grand blue</strong><small>Six-week sprint</small></span>
          </Link>
          <nav aria-label="Primary navigation" className={styles.nav}>
            {navigation.map((item) => {
              const active = pathname === item.href;
              return <Link key={item.href} href={item.href} className={active ? styles.active : undefined} aria-current={active ? "page" : undefined}>
                <span>{item.icon}</span>{item.label}
              </Link>;
            })}
          </nav>
          <div className={styles.sidebarFooter}>
            <span className={styles.statusDot} aria-hidden="true" /> Sprint in progress
            <strong>30h / week</strong>
          </div>
        </aside>
        <div className={styles.mainColumn}>
          <header className={styles.topbar}>
            <span className={styles.mobileBrand}>grand blue</span>
            <div className={styles.topbarActions}>
              <span className={styles.target}>TARGET · 30 HOURS</span>
              <form action={signOut}><button className={styles.signOut} type="submit">Sign out</button></form>
              <button className={styles.themeButton} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
                {theme === "dark" ? "☼" : "◐"}
              </button>
            </div>
          </header>
          <LocalDataImport />
          <main className={styles.content}>{children}</main>
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            {navigation.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? styles.active : undefined}>{item.label}</Link>)}
          </nav>
        </div>
      </div>
    </LearningProvider></ProgressProvider>
  );
}
