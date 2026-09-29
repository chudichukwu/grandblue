import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import styles from "../auth.module.css";

export default async function SignUpPage({ searchParams }: PageProps<"/auth/sign-up">) {
  const params = await searchParams;
  return <main className={styles.page}><section className={styles.card}><Link href="/" className={styles.brand}><span className={styles.mark}>GB</span> grand blue</Link><span className="eyebrow">Start the sprint</span><h1>Create account.</h1><p className={styles.intro}>Your progress will be private and available on every signed-in device.</p>
    {typeof params.error === "string" && <p className={styles.error} role="alert">{params.error}</p>}
    <form action={signUp} className={styles.form}><label>Display name<input name="displayName" autoComplete="name" required maxLength={80} /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label><label>Timezone<select name="timezone" defaultValue="Africa/Lagos"><option value="Africa/Lagos">Africa/Lagos</option><option value="Europe/London">Europe/London</option><option value="America/New_York">America/New_York</option><option value="America/Los_Angeles">America/Los_Angeles</option><option value="Asia/Dubai">Asia/Dubai</option><option value="Asia/Kolkata">Asia/Kolkata</option></select></label><button className="primary-button" type="submit">Create account <span aria-hidden="true">↗</span></button></form>
    <div className={styles.links}><Link href="/auth/sign-in">Already have an account?</Link></div>
  </section></main>;
}
