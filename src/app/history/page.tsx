"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { formatEntryDate } from "@/lib/date";
import { totalMinutes } from "@/lib/metrics";
import type { DailyEntry } from "@/lib/types";
import styles from "./page.module.css";

type Category = "all" | "coursera" | "practice" | "project" | "review";
const PAGE_SIZE = 10;
export default function HistoryPage() {
  const { entries, hydrated, error, deleteEntry } = useProgress(); const [date, setDate] = useState(""); const [week, setWeek] = useState(""); const [category, setCategory] = useState<Category>("all"); const [limit, setLimit] = useState(PAGE_SIZE); const [busy, setBusy] = useState<string | null>(null);
  const filtered = useMemo(() => entries.filter((entry) => { if (date && entry.date !== date) return false; if (week) { const start = weekStart(week); const end = new Date(`${start}T12:00:00Z`); end.setUTCDate(end.getUTCDate()+6); if (entry.date < start || entry.date > end.toISOString().slice(0,10)) return false; } if (category !== "all" && categoryMinutes(entry, category) === 0) return false; return true; }).sort((a,b)=>b.date.localeCompare(a.date)), [entries,date,week,category]);
  const total = filtered.reduce((sum,entry)=>sum+totalMinutes(entry),0); const average = filtered.length ? Math.round(total/filtered.length) : 0;
  if (!hydrated) return <div className={styles.state}>Loading check-in history…</div>;
  return <div className={styles.page}><header className={styles.heading}><div><span className="eyebrow">Evidence archive</span><h1>Check-in history.</h1><p>Review the work, edit the record and find patterns across weeks.</p></div><Link className="primary-button" href="/check-in">New check-in ↗</Link></header>{error&&<div className="error-banner">{error}</div>}
    <section className={styles.filters}><label>Date<input type="date" value={date} onChange={(e)=>{setDate(e.target.value);setLimit(PAGE_SIZE)}} /></label><label>Week<input type="week" value={week} onChange={(e)=>{setWeek(e.target.value);setLimit(PAGE_SIZE)}} /></label><label>Category<select value={category} onChange={(e)=>{setCategory(e.target.value as Category);setLimit(PAGE_SIZE)}}><option value="all">All categories</option><option value="coursera">Coursera</option><option value="practice">Practice</option><option value="project">Project</option><option value="review">Review</option></select></label><button onClick={()=>{setDate("");setWeek("");setCategory("all")}}>Clear</button></section>
    <section className={styles.summary}><div><span>Total</span><strong>{(total/60).toFixed(1)}h</strong></div><div><span>Daily average</span><strong>{Math.floor(average/60)}h {average%60}m</strong></div><div><span>Entries</span><strong>{filtered.length}</strong></div></section>
    <section className={styles.list}>{filtered.length===0?<div className={styles.state}><strong>No matching check-ins.</strong><p>Adjust the filters or create a new entry.</p></div>:filtered.slice(0,limit).map((entry)=><article key={entry.id}><div className={styles.date}><strong>{formatEntryDate(entry.date,{day:"2-digit"})}</strong><span>{formatEntryDate(entry.date,{month:"short",year:"numeric"})}</span></div><div className={styles.details}><h2>{(totalMinutes(entry)/60).toFixed(1)} hours</h2><p>{entry.reflection||"No reflection recorded."}</p><div><span>Course {entry.courseraMinutes}m</span><span>Practice {entry.practiceMinutes}m</span><span>Project {entry.projectMinutes}m</span><span>Review {entry.reviewMinutes}m</span></div></div><div className={styles.actions}><Link href={`/check-in?date=${entry.date}`}>Edit</Link><button disabled={busy===entry.id} onClick={async()=>{if(window.confirm(`Delete the check-in for ${entry.date}? This cannot be undone.`)){setBusy(entry.id);await deleteEntry(entry.id);setBusy(null)}}}>{busy===entry.id?"Deleting…":"Delete"}</button></div></article>)}</section>
    {limit<filtered.length&&<button className={styles.load} onClick={()=>setLimit((value)=>value+PAGE_SIZE)}>Load more</button>}
  </div>;
}
function categoryMinutes(entry:DailyEntry,category:Exclude<Category,"all">){return category==="coursera"?entry.courseraMinutes:category==="practice"?entry.practiceMinutes:category==="project"?entry.projectMinutes:entry.reviewMinutes}
function weekStart(value:string){const [year,week]=value.split("-W").map(Number);const jan4=new Date(Date.UTC(year,0,4));const monday=new Date(jan4);monday.setUTCDate(jan4.getUTCDate()-(jan4.getUTCDay()||7)+1+(week-1)*7);return monday.toISOString().slice(0,10)}
