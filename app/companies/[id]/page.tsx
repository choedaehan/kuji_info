'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ManufacturerDetail = {
  id: number;
  name: string;
  officialUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ManufacturerDetailPage() {
  const params = useParams();
  const router = useRouter();

  const manufacturerId = params.id as string;

  const [manufacturer, setManufacturer] = useState<ManufacturerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const handleDelete = async () => {
    const confirmed = confirm('이 제조사를 삭제하시겠습니까?');

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/companies/${manufacturerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || '제조사 삭제에 실패했습니다.');
        return;
      }

      alert('삭제되었습니다.');
      router.push('/companies');
    } catch {
      alert('서버 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const getManufacturer = async () => {
      try {
        setLoading(true);
        setMessage('');

        const response = await fetch(`/api/companies/${manufacturerId}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || '제조사 정보를 불러오지 못했습니다.');
          return;
        }

        setManufacturer(data);
      } catch {
        setMessage('서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (manufacturerId) {
      getManufacturer();
    }
  }, [manufacturerId]);

  if (loading) {
    return <div style={styles.page}>불러오는 중...</div>;
  }

  if (message || !manufacturer) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <button type="button" style={styles.backButton} onClick={() => router.back()}>
            뒤로가기
          </button>
          <p style={styles.message}>{message || '제조사 정보를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button type="button" style={styles.backButton} onClick={() => router.back()}>
            뒤로가기
          </button>

          <div style={styles.actions}>
            <Link href={`/companies/${manufacturer.id}/edit`} style={styles.editButton}>
              수정
            </Link>
            <button type="button" style={styles.deleteButton} onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>

        <h1 style={styles.title}>{manufacturer.name}</h1>

        <div style={styles.infoList}>
          <div style={styles.infoRow}>
            <span style={styles.label}>공식 링크</span>
            {manufacturer.officialUrl ? (
              <a
                href={manufacturer.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                공식 링크 이동
              </a>
            ) : (
              <span>-</span>
            )}
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>등록일</span>
            <span>{formatDate(manufacturer.createdAt)}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>수정일</span>
            <span>{formatDate(manufacturer.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f8',
    padding: 24,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  backButton: {
    border: '1px solid #dcdfe3',
    backgroundColor: '#ffffff',
    padding: '9px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  editButton: {
    backgroundColor: '#111827',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: 6,
    textDecoration: 'none',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '10px 14px',
    borderRadius: 6,
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
  },
  title: {
    margin: '0 0 28px 0',
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  infoRow: {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: 12,
    fontSize: 14,
  },
  label: {
    width: 100,
    color: '#666666',
    fontWeight: 600,
    flexShrink: 0,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: '#374151',
  },
};
