"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0 }}
      >
        {/* Header */}
        <header
          style={{
            height: 56,
            background: "#111",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            fontWeight: 600,
          }}
        >
          🎰 Kuji
        </header>

        <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
          {/* Sidebar */}
          {!isHome && (
            <aside
              style={{
                width: 220,
                borderRight: "1px solid #e5e7eb",
                padding: 16,
                fontSize: 14,
              }}
            >
              <Nav />
            </aside>
          )}

          {/* Content */}
          <main
            style={{
              flex: 1,
              padding: isHome ? 16 : 24,
              maxWidth: isHome ? 480 : "none",
              margin: isHome ? "0 auto" : undefined,
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

/* ---------- Sidebar ---------- */

function Nav() {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <NavItem href="/">메인</NavItem>

      <Section title="관리">
        <NavItem href="/ips/new">IP 등록</NavItem>
        <NavItem href="/ips">IP 리스트</NavItem>
        <NavItem href="/goods/new">굿즈 등록</NavItem>
        <NavItem href="/ip-events/new">이벤트 등록</NavItem>
        <NavItem href="/kuji-series/new">쿠지 시리즈 등록</NavItem>
        <NavItem href="/kuji-prize/new">상품 등록</NavItem>
        <NavItem href="/kuji-observation/new">
          Observation 입력
        </NavItem>
      </Section>
    </nav>
  );
}

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",          // ✅ 개행 핵심
        padding: "6px 8px",
        borderRadius: 4,
        textDecoration: "none",
        color: "#111",
      }}
    >
      {children}
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          marginBottom: 6,
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
        }}
      >
        {title}
      </div>

      {/* ✅ Section 내부도 명확히 세로 정렬 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {children}
      </div>
    </div>
  );
}
