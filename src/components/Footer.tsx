import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer no-print">
      <div className="footer-inner">
        <Link href="/" className="footer-logo">
          <span style={{ color: "#1B3D33" }}>✦</span> Clean<span>Press</span>
        </Link>
        <div className="footer-text">
          Le soin textile, avec clarté. © {new Date().getFullYear()} CleanPress
        </div>
      </div>
    </footer>
  );
}