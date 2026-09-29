import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import styles from "../auth.module.css";

export default async function SignInPage({ searchParams }: PageProps<"/auth/sign-in">) {
  const params = await searchParams;
  return <main className={styles.page}><section className={styles.card}><Link href="/" className={styles.brand}><span className={styles.mark}>GB</span> grand blue</Link><span className="eyebrow">Secure access</span><h1>Welcome back.</h1><p className={styles.intro}>Sign in to sync your sprint across devices.</p>
    {typeof params.error === "string" && <p className={styles.error} role="alert">{params.error}</p>}{typeof params.message === "string" && <p className={styles.notice}>{params.message}</p>}
    <form action={signIn} className={styles.form}><input type="hidden" name="next" value={typeof params.next === "string" ? params.next : "/"} /><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label><button className="primary-button" type="submit">Sign in <span aria-hidden="true">↗</span></button></form>
    <div className={styles.links}><Link href="/auth/sign-up">Create account</Link><Link href="/auth/forgot-password">Forgot password?</Link></div>
  </section></main>;
}
