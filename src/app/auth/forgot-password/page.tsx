import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";
import styles from "../auth.module.css";

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/auth/forgot-password">) {
  const params = await searchParams;
  return <main className={styles.page}><section className={styles.card}><Link href="/" className={styles.brand}><span className={styles.mark}>GB</span> grand blue</Link><span className="eyebrow">Account recovery</span><h1>Reset password.</h1><p className={styles.intro}>We’ll send a secure recovery link to your email.</p>
    {typeof params.error === "string" && <p className={styles.error} role="alert">{params.error}</p>}{typeof params.message === "string" && <p className={styles.notice}>{params.message}</p>}
    <form action={requestPasswordReset} className={styles.form}><label>Email<input name="email" type="email" autoComplete="email" required /></label><button className="primary-button" type="submit">Send reset link <span aria-hidden="true">↗</span></button></form><div className={styles.links}><Link href="/auth/sign-in">Back to sign in</Link></div>
  </section></main>;
}
