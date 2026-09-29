"use client";
import Link from "next/link";import {useTimer}from"@/components/TimerProvider";import{formatClock}from"@/lib/timer";import styles from"./BreakBanner.module.css";
export function BreakBanner(){const{session,remaining}=useTimer();if(!session||session.mode==="focus"||!["active","paused"].includes(session.status))return null;return <Link href="/timer" className={styles.banner}><strong>{session.mode==="long_break"?"Long break":"Short break"}</strong><span>{session.status==="paused"?"Paused":"Active"} · {formatClock(remaining)} remaining</span></Link>;}
