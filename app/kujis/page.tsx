'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type KujiItem = {
  id: number;
  name: string;
  japanPricePerTry: number | null;
  koreaPricePerTry: number | null;
  totalCount: number | null;
  japanReleaseDate: string | null;
  koreaReleaseDate: string | null;
  createdAt: string;
  ip: {
    id: number;
    name: string;
  };
  _count: {
    lineups: number;
  };
};

export default function KujisPage() {
  const router = useRouter();

  const [kujiList, setKujiList] = useState<KujiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getKujiList = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/kujis');
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '쿠지 목록을 불러오지 못했습니다.');
        return;
      }

      setKujiList(data);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKujiList();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>쿠지 목록</h1>
          <p style={styles.description}>등록된 쿠지 정보를 확인할 수 있습니다.</p>
        </div>

        <Link href="/kujis/new" style={styles.createButton}>
          쿠지 등록
        </Link>
      </div>

      {message ? <div style={styles.message}>{message}</div> : null}

      {loading ? (
        <div style={styles.loading}>불러오는 중...</div>
      ) : kujiList.length === 0 ? (
        <div style={styles.emptyBox}>등록된 쿠지가 없습니다.</div>
      ) : (
        <div style={styles.list}>
          {kujiList.map((kuji) => (
            <div
              key={kuji.id}
              style={styles.item}
              onClick={() => router.push(`/kujis/${kuji.id}`)}
            >
              <div style={styles.itemTitle}>{kuji.name}</div>

              <div style={styles.metaRow}>
                <span style={styles.label}>IP</span>
                <span style={styles.value}>{kuji.ip.name}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.label}>가격</span>
                <span style={styles.value}>
                  일본 {formatPrice(kuji.japanPricePerTry)} / 국내 {formatPrice(kuji.koreaPricePerTry)}
                </span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.label}>출시일</span>
                <span style={styles.value}>
                  일본 {formatDate(kuji.japanReleaseDate)} / 국내 {formatDate(kuji.koreaReleaseDate)}
                </span>
              </div>

              <div style={styles.createdAt}>
                총 수량: {kuji.totalCount?.toLocaleString('ko-KR') ?? '-'} · 라인업 {kuji._count.lineups}개
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatPrice(value: number | null) {
  return typeof value === 'number' ? value.toLocaleString('ko-KR') : '-';
}

function formatDate(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    backgroundColor: '#ffffff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
  },
  description: {
    marginTop: '8px',
    marginBottom: 0,
    fontSize: '14px',
    color: '#666',
  },
  createButton: {
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#111827',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  message: {
    marginBottom: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '14px',
  },
  loading: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#666',
  },
  emptyBox: {
    padding: '48px 24px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#fafafa',
  },
  list: {
    display: 'grid',
    gap: '16px',
  },
  item: {
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  itemTitle: {
    marginBottom: '14px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
  },
  metaRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '14px',
  },
  label: {
    minWidth: '64px',
    color: '#6b7280',
    fontWeight: 600,
  },
  value: {
    color: '#111827',
    wordBreak: 'break-all',
  },
  createdAt: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '13px',
    color: '#6b7280',
  },
};
