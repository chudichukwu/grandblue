"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@/components/ProgressProvider";
import { toLocalDateKey } from "@/lib/date";
import type { DailyEntryInput, Score } from "@/lib/types";
import styles from "./page.module.css";

type NumericField = "courseraMinutes" | "practiceMinutes" | "projectMinutes" | "reviewMinutes" | "modulesCompleted";
const todayKey = toLocalDateKey();
const initialForm: DailyEntryInput = { date: todayKey, courseraMinutes: 0, practiceMinutes: 0, projectMinutes: 0, reviewMinutes: 0, modulesCompleted: 0, energyScore: 3, focusScore: 3, completedTasks: "", blockers: "", reflection: "" };

export default function CheckInPage() {
  const { entries, error: storageError, saveEntry } = useProgress();
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const loadedDate = useRef("");
  const total = useMemo(() => form.courseraMinutes + form.practiceMinutes + form.projectMinutes + form.reviewMinutes, [form]);
  const duplicate = entries.some((entry) => entry.date === form.date);

  useEffect(() => {
    const requestedDate = new URLSearchParams(window.location.search).get("date");
    const timer = window.setTimeout(() => {
      const targetDate = requestedDate || form.date;
      const entry = entries.find((item) => item.date === targetDate);
      if (entry && loadedDate.current !== targetDate) {
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = entry;
        void _id; void _createdAt; void _updatedAt;
        loadedDate.current = targetDate;
        setForm(input);
      } else if (requestedDate && loadedDate.current !== targetDate && entries.length > 0) {
        loadedDate.current = targetDate;
        setForm({ ...initialForm, date: targetDate });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [entries, form.date]);

  function changeDate(date: string) {
    const entry = entries.find((item) => item.date === date);
    loadedDate.current = entry ? date : "";
    if (entry) {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = entry;
      void _id; void _createdAt; void _updatedAt;
      setForm(input);
    } else {
      setForm({ ...initialForm, date });
    }
  }

  function setNumber(field: NumericField, value: string) {
    setForm((current) => ({ ...current, [field]: Math.max(0, Math.floor(Number(value) || 0)) }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    if (saving) return;
    event.preventDefault();
    if (!form.date || form.date > todayKey) { setFormError("Choose today or an earlier date."); return; }
    if (total <= 0) { setFormError("Record at least one minute of study time."); return; }
    if (!Number.isInteger(form.modulesCompleted)) { setFormError("Modules completed must be a whole number."); return; }
    setFormError(null);
    setSaving(true);
    await saveEntry(form);
    setSaving(false);
  }

  return <div className={styles.page}>
    <header className={styles.heading}><div><span className="eyebrow">Daily evidence</span><h1>Log the work.</h1><p>Capture the hours, friction and lessons while they are fresh.</p></div><div className={styles.total}><span>Today’s total</span><strong>{Math.floor(total / 60)}h {total % 60}m</strong><small>{Math.round((total / 300) * 100)}% of daily target</small></div></header>
    {(formError || storageError) && <div className="error-banner" role="alert">{formError || storageError}</div>}
    <form onSubmit={submit} className={styles.form} noValidate>
      <section className={styles.section}><div className={styles.sectionNumber}>01</div><div className={styles.sectionBody}><div className={styles.sectionHeading}><h2>Time invested</h2><p>Enter focused minutes for each part of the sprint.</p></div>
        <div className={styles.fields}><label className={styles.full}>Date<input type="date" value={form.date} max={todayKey} required onChange={(event) => changeDate(event.target.value)} />{duplicate && <small>An entry exists for this date. Its values are loaded below and saving will update it.</small>}</label>
          <MinuteField label="Coursera study" value={form.courseraMinutes} onChange={(value) => setNumber("courseraMinutes", value)} /><MinuteField label="Practical exercises" value={form.practiceMinutes} onChange={(value) => setNumber("practiceMinutes", value)} /><MinuteField label="Project work" value={form.projectMinutes} onChange={(value) => setNumber("projectMinutes", value)} /><MinuteField label="Review & documentation" value={form.reviewMinutes} onChange={(value) => setNumber("reviewMinutes", value)} />
          <label>Lessons or modules completed<input type="number" min="0" step="1" value={form.modulesCompleted} onChange={(event) => setNumber("modulesCompleted", event.target.value)} /></label>
        </div></div></section>
      <section className={styles.section}><div className={styles.sectionNumber}>02</div><div className={styles.sectionBody}><div className={styles.sectionHeading}><h2>Performance signal</h2><p>Score the quality of the session, not the outcome.</p></div><div className={styles.scoreGrid}><ScoreField label="Energy" value={form.energyScore} onChange={(value) => setForm({ ...form, energyScore: value })} /><ScoreField label="Focus" value={form.focusScore} onChange={(value) => setForm({ ...form, focusScore: value })} /></div></div></section>
      <section className={styles.section}><div className={styles.sectionNumber}>03</div><div className={styles.sectionBody}><div className={styles.sectionHeading}><h2>Session notes</h2><p>Build a record you can learn from at the end of the week.</p></div><div className={styles.textFields}><label>Tasks completed<textarea rows={3} placeholder="What did you finish?" value={form.completedTasks} onChange={(event) => setForm({ ...form, completedTasks: event.target.value })} /></label><label>Blockers<textarea rows={3} placeholder="What slowed you down?" value={form.blockers} onChange={(event) => setForm({ ...form, blockers: event.target.value })} /></label><label>Daily reflection<textarea rows={5} placeholder="What clicked? What will you change tomorrow?" value={form.reflection} onChange={(event) => setForm({ ...form, reflection: event.target.value })} /></label></div></div></section>
      <div className={styles.actions}><p>{duplicate ? "This will replace the saved values for this date." : "A new daily record will be created."}</p><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : duplicate ? "Update check-in" : "Save check-in"} <span aria-hidden="true">↗</span></button></div>
    </form>
  </div>;
}

function MinuteField({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) { return <label>{label}<div className={styles.inputUnit}><input type="number" inputMode="numeric" min="0" max="1440" step="1" value={value} onChange={(event) => onChange(event.target.value)} /><span>MIN</span></div></label>; }

function ScoreField({ label, value, onChange }: { label: string; value: Score; onChange: (value: Score) => void }) { return <fieldset><legend>{label}</legend><div className={styles.scoreOptions}>{([1, 2, 3, 4, 5] as Score[]).map((score) => <label key={score} className={value === score ? styles.selected : undefined}><input type="radio" name={label.toLowerCase()} value={score} checked={value === score} onChange={() => onChange(score)} /><span>{score}</span></label>)}</div><div className={styles.scale}><span>Low</span><span>Excellent</span></div></fieldset>; }
