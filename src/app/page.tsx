"use client";
import Link from "next/link";
import { ProgressCard } from "@/components/ProgressCard";
import { useProgress } from "@/components/ProgressProvider";
import { WeeklyChart } from "@/components/WeeklyChart";
import { formatEntryDate } from "@/lib/date";
import { getDashboardMetrics, totalMinutes } from "@/lib/metrics";
import { plannedTasks } from "@/lib/seed";
import styles from "./page.module.css";

function hours(minutes: number): string { return `${(minutes / 60).toFixed(1)}h`; }

export default function Dashboard() {
  const { entries, error, hydrated } = useProgress();
  const metrics = getDashboardMetrics(entries);
  return <div className={styles.dashboard}>
    <header className={styles.heading}><div><span className="eyebrow">Command center</span><h1>Keep the pressure on.</h1><p>Six weeks. One clear target. Make today count.</p></div><Link href="/check-in" className="primary-button">Log today <span aria-hidden="true">↗</span></Link></header>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {!hydrated ? <div className={styles.loading} aria-live="polite">Loading your sprint…</div> : <>
      <section className={styles.metrics} aria-label="Sprint metrics">
        <ProgressCard label="Today" value={hours(metrics.todayMinutes)} detail="of 5 hour target" progress={(metrics.todayMinutes / 300) * 100} />
        <ProgressCard label="This week" value={hours(metrics.weeklyMinutes)} detail={`${Math.max(0, 30 - metrics.weeklyMinutes / 60).toFixed(1)}h remaining`} progress={(metrics.weeklyMinutes / 1800) * 100} accent="orange" />
        <ProgressCard label="Current streak" value={`${metrics.streak} days`} detail="Consistency compounds" accent="green" />
        <ProgressCard label="Six-week sprint" value={`${metrics.sprintProgress}%`} detail="Time elapsed" progress={metrics.sprintProgress} />
        <ProgressCard label="Course" value={`${metrics.courseProgress}%`} detail={`${entries.reduce((sum, item) => sum + item.modulesCompleted, 0)} of 36 modules`} progress={metrics.courseProgress} accent="orange" />
      </section>
      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.chartPanel}`}><div className={styles.panelHeading}><div><span className="eyebrow">Workload</span><h2>Weekly distribution</h2></div><span className={styles.unit}>HOURS</span></div><WeeklyChart entries={metrics.weeklyEntries} /></section>
        <section className={styles.panel}><div className={styles.panelHeading}><div><span className="eyebrow">Execution</span><h2>Today’s plan</h2></div><span className={styles.taskCount}>{plannedTasks.filter((task) => task.completed).length}/{plannedTasks.length}</span></div><ul className={styles.tasks}>{plannedTasks.map((task) => <li key={task.id} className={task.completed ? styles.done : undefined}><span className={styles.check} aria-hidden="true">{task.completed ? "✓" : ""}</span><div><strong>{task.title}</strong><small>{task.category} · {task.durationMinutes} min</small></div></li>)}</ul></section>
      </div>
      <section className={styles.panel}><div className={styles.panelHeading}><div><span className="eyebrow">Evidence</span><h2>Recent check-ins</h2></div><span className={styles.unit}>LATEST 4</span></div><div className={styles.recentList}>{entries.length === 0 ? <div className={styles.empty}><strong>No check-ins yet.</strong><p>Log your first focused session to start building evidence.</p><Link href="/check-in">Create first check-in →</Link></div> : [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((entry) => <article key={entry.id}><time dateTime={entry.date}><strong>{formatEntryDate(entry.date, { day: "2-digit" })}</strong><span>{formatEntryDate(entry.date, { month: "short" })}</span></time><div className={styles.entrySummary}><strong>{hours(totalMinutes(entry))} focused work</strong><p>{entry.reflection || "No reflection recorded."}</p></div><div className={styles.scores}><span>Energy <b>{entry.energyScore}/5</b></span><span>Focus <b>{entry.focusScore}/5</b></span></div></article>)}</div></section>
    </>}
  </div>;
}
