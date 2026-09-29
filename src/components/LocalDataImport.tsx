"use client";

import { useEffect, useState } from "react";
import { localDataRepository, type LocalDataInspection } from "@/lib/storage";
import { useProgress } from "@/components/ProgressProvider";
import styles from "./LocalDataImport.module.css";

export function LocalDataImport() {
  const { reload } = useProgress();
  const [inspection, setInspection] = useState<LocalDataInspection>({ status: "none", entries: [] });
  const [serverImported, setServerImported] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setInspection(localDataRepository.inspect());
      try {
        const response = await fetch("/api/import/local-data", { cache: "no-store" });
        const payload = await response.json();
        setServerImported(response.ok ? payload.imported : true);
        if (!response.ok) setMessage(payload.error ?? "Import status could not be checked.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Import status could not be checked.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (serverImported || inspection.status === "none") return null;
  if (inspection.status === "invalid") return <aside className={styles.panel} role="alert"><div><strong>Local progress needs attention</strong><p>{inspection.error} It has not been deleted.</p></div></aside>;

  async function importData() {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/import/local-data", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entries: inspection.entries }) });
      const payload = await response.json();
      if (!response.ok || !payload.complete) {
        const detail = payload.failures?.map((failure: { date: string; error: string }) => `${failure.date}: ${failure.error}`).join("; ");
        setMessage(`${payload.importedCount ?? 0} imported, ${payload.failedCount ?? inspection.entries.length} failed. ${detail || payload.error || "Local data remains unchanged."}`);
        return;
      }
      localDataRepository.removeAfterSuccessfulImport();
      await reload();
      setServerImported(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed. Local data remains unchanged.");
    } finally { setBusy(false); }
  }

  return <aside className={styles.panel}><div><strong>Bring your Phase 1 progress with you</strong><p>{inspection.entries.length} local check-ins are ready for a one-time secure import. The local copy stays intact until every record succeeds.</p>{message && <small role="alert">{message}</small>}</div><button type="button" onClick={importData} disabled={busy}>{busy ? "Importing…" : "Import local data"}</button></aside>;
}
