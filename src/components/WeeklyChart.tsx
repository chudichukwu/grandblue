"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatEntryDate } from "@/lib/date";
import type { DailyEntry } from "@/lib/types";

export function WeeklyChart({ entries }: { entries: DailyEntry[] }) {
  const data = [...entries].sort((a, b) => a.date.localeCompare(b.date)).map((entry) => ({ day: formatEntryDate(entry.date, { weekday: "short" }), Coursera: +(entry.courseraMinutes / 60).toFixed(1), Practice: +(entry.practiceMinutes / 60).toFixed(1), Project: +(entry.projectMinutes / 60).toFixed(1), Review: +(entry.reviewMinutes / 60).toFixed(1) }));
  if (!data.length) return <div className="empty-chart">Your weekly distribution will appear after the first check-in.</div>;
  return <div style={{ width: "100%", height: 280 }} aria-label="Weekly hours by category"><ResponsiveContainer><BarChart data={data} margin={{ top: 12, right: 4, left: -22, bottom: 0 }}>
    <CartesianGrid vertical={false} stroke="var(--line)" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 10 }} />
    <Tooltip contentStyle={{ background: "var(--surface-deep)", border: "1px solid var(--line)", borderRadius: 6, color: "var(--text)" }} cursor={{ fill: "var(--hover)" }} /><Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
    <Bar dataKey="Coursera" stackId="time" fill="#39d7ff" /><Bar dataKey="Practice" stackId="time" fill="#ff9e44" /><Bar dataKey="Project" stackId="time" fill="#9b7cff" /><Bar dataKey="Review" stackId="time" fill="#38d996" radius={[3, 3, 0, 0]} />
  </BarChart></ResponsiveContainer></div>;
}
