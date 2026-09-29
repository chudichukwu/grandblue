import styles from "./ProgressCard.module.css";

interface ProgressCardProps { label: string; value: string; detail: string; progress?: number; accent?: "cyan" | "orange" | "green"; }

export function ProgressCard({ label, value, detail, progress, accent = "cyan" }: ProgressCardProps) {
  return <article className={`${styles.card} ${styles[accent]}`}>
    <span className={styles.label}>{label}</span><strong>{value}</strong><span className={styles.detail}>{detail}</span>
    {typeof progress === "number" && <div className={styles.track} aria-label={`${Math.round(progress)} percent`}><span style={{ width: `${Math.min(100, progress)}%` }} /></div>}
  </article>;
}
