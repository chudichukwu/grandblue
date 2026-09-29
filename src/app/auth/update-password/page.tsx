import { updatePassword } from "@/app/auth/actions";
import styles from "../auth.module.css";

export default async function UpdatePasswordPage({ searchParams }: PageProps<"/auth/update-password">) {
  const params = await searchParams;
  return <main className={styles.page}><section className={styles.card}><span className={styles.brand}><span className={styles.mark}>GB</span> grand blue</span><span className="eyebrow">Account recovery</span><h1>Choose a password.</h1><p className={styles.intro}>Use at least eight characters.</p>
    {typeof params.error === "string" && <p className={styles.error} role="alert">{params.error}</p>}
    <form action={updatePassword} className={styles.form}><label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label><button className="primary-button" type="submit">Update password <span aria-hidden="true">↗</span></button></form>
  </section></main>;
}
