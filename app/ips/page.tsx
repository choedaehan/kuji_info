'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type IpItem = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export default function IpListPage() {
  const router = useRouter();

  const [ipList, setIpList] = useState<IpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getIpList = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/ips', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'IP 목록을 불러오지 못했습니다.');
        return;
      }

      setIpList(data);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIpList();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>IP 목록</h1>
          <a href="/ips/new" style={styles.linkButton}>
            IP 등록
          </a>
        </div>

        {loading ? (
          <p style={styles.message}>불러오는 중...</p>
        ) : message ? (
          <p style={styles.message}>{message}</p>
        ) : ipList.length === 0 ? (
          <p style={styles.message}>등록된 IP가 없습니다.</p>
        ) : (
          <div style={styles.list}>
            {ipList.map((ip) => (
              <div key={ip.id} style={styles.item}
                onClick={() => router.push(`/ips/${ip.id}`)}
              >
                <div>
                  <p style={styles.name}>{ip.name}</p>
                  <p style={styles.slug}>/{ip.slug}</p>
                </div>

                <div style={styles.meta}>
                  <p style={styles.date}>
                    {new Date(ip.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
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
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },
  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
  },
  slug: {
    margin: '6px 0 0 0',
    fontSize: 14,
    color: '#6b7280',
  },
  meta: {
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