import Link from "next/link";

export function FooterDisclaimer() {
  return (
    <footer className="shell-footer">
      <p>RenalCare adalah alat pemantau dan edukasi, bukan pengganti dokter.</p>
      <nav
        className="footer-legal-links"
        aria-label="Kebijakan privasi, syarat, dan darurat"
      >
        <Link href="/privasi">Kebijakan Privasi</Link>
        <span aria-hidden="true">·</span>
        <Link href="/syarat">Syarat &amp; Ketentuan</Link>
        <span aria-hidden="true">·</span>
        <Link href="/tanda-bahaya">Tanda Bahaya</Link>
      </nav>
    </footer>
  );
}
