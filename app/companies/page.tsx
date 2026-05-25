'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ManufacturerItem = {
  id: number;
  name: string;
  officialUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function CompaniesPage() {
  const router = useRouter();

  const [manufacturers, setManufacturers] = useState<ManufacturerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getManufacturerList = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/companies', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '제조사 목록을 불러오지 못했습니다.');
        return;
      }

      setManufacturers(data);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getManufacturerList();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>제조사 목록</h1>
          <Link href="/companies/new" style={styles.linkButton}>
            제조사 등록
          </Link>
        </div>

        {loading ? (
          <p style={styles.message}>불러오는 중...</p>
        ) : message ? (
          <p style={styles.message}>{message}</p>
        ) : manufacturers.length === 0 ? (
          <p style={styles.message}>등록된 제조사가 없습니다.</p>
        ) : (
          <div style={styles.list}>
            {manufacturers.map((manufacturer) => (
              <div
                key={manufacturer.id}
                style={styles.item}
                onClick={() => router.push(`/companies/${manufacturer.id}`)}
              >
                <div style={styles.content}>
                  <p style={styles.name}>{manufacturer.name}</p>
                  <p style={styles.url}>
                    {manufacturer.officialUrl || '공식 링크 없음'}
                  </p>
                </div>

                <div style={styles.meta}>
                  <p style={styles.date}>{formatDate(manufacturer.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f8',
    padding: '40px 20px',
  },
  card: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: '0 16px',
    borderRadius: 6,
    backgroundColor: '#111827',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
  },
  content: {
    minWidth: 0,
  },
  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
  },
  url: {
    margin: '6px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 14,
    color: '#6b7280',
  },
  meta: {
    flexShrink: 0,
    textAlign: 'right',
  },
  date: {
    margin: 0,
    fontSize: 13,
    color: '#9ca3af',
  },
  message: {
    fontSize: 14,
    color: '#374151',
  },
};
