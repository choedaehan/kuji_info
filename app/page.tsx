'use client';

import Link from 'next/link';

const menuItems = [
  {
    href: '/ips',
    title: 'IP 관리',
    description: '작품, 게임, 캐릭터 IP의 기본 정보를 관리합니다.',
  },
  {
    href: '/companies',
    title: '제조사 관리',
    description: '굿즈 제조사 정보를 관리합니다.',
  },
  {
    href: '/ip-events',
    title: '이벤트 관리',
    description: '팝업, 콜라보, 온라인 판매 이벤트를 관리합니다.',
  },
  {
    href: '/goods',
    title: '굿즈 관리',
    description: '공식 가격, 판매 정보, 구성품 정보를 관리합니다.',
  },
  {
    href: '/kujis',
    title: '쿠지 관리',
    description: '쿠지 기본 정보와 라인업을 관리합니다.',
  },
];

export default function HomePage() {
  return (
    <div style={styles.page}>
      <section style={styles.header}>
        <h1 style={styles.title}>Goods Archive</h1>
        <p style={styles.description}>
          IP 기반 굿즈 정보를 수집하고 관리하는 내부 도구입니다.
        </p>
      </section>

      <section style={styles.grid}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} style={styles.card}>
            <strong style={styles.cardTitle}>{item.title}</strong>
            <span style={styles.cardDescription}>{item.description}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    maxWidth: 960,
    margin: '0 auto',
    padding: '48px 24px',
  },
  header: {
    marginBottom: 28,
  },
  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 700,
    color: '#111827',
  },
  description: {
    margin: '10px 0 0 0',
    fontSize: 15,
    color: '#6b7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minHeight: 116,
    padding: 20,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#111827',
    textDecoration: 'none',
  },
  cardTitle: {
    fontSize: 18,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 1.5,
    color: '#6b7280',
  },
};
