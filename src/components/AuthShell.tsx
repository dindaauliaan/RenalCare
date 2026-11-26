import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, HeartPulse } from "lucide-react";
import { FooterDisclaimer } from "./FooterDisclaimer";

export function AuthShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="auth-layout">
      <header className="auth-topbar">
        <Link href="/" className="brand auth-brand">
          <div className="brand-mark">
            <HeartPulse size={22} strokeWidth={1.8} />
          </div>
          <div>
            <b>RenalCare</b>
            <span>Kidney Health Monitor</span>
          </div>
        </Link>

        <Link href="/tanda-bahaya" className="emergency-btn">
          <AlertTriangle size={19} strokeWidth={1.8} /> <span>Tanda Bahaya / IGD</span>
        </Link>
      </header>

      <main className="auth-main">
        <div className={wide ? "auth-container wide" : "auth-container"}>{children}</div>
      </main>

      <FooterDisclaimer />
    </div>
  );
}
