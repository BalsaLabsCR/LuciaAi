import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Lucia AI es un proyecto de BalsaLabs LLC.</p>
      <nav className="site-footer__links" aria-label="Legal">
        <Link href="/privacy-policy">Política de privacidad</Link>
      </nav>
    </footer>
  );
}
