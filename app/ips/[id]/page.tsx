'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type IpDetail = {
  id: number;
  name: string;
  englishName: string | null;
  originalName: string | null;
  officialUrl: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function IpDetailPage() {
  const params = useParams();
  const router = useRouter();

  const ipId = params.id as string;

  const [ip, setIp] = useState<IpDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getIp = async () => {
      try {
        const response = await fetch(`/api/ips/${ipId}`);

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || 'IP 정보를 불러오지 못했습니다.');
          return;
        }

        setIp(data);
      } catch {
        alert('IP 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (ipId) {
      getIp();
    }
  }, [ipId]);

  const handleDelete = async () => {
    const confirmed = confirm('이 IP를 삭제하시겠습니까?');

    if (!confirmed) return;

    const response = await fetch(`/api/ips/${ipId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      alert('삭제에 실패했습니다.');
      return;
    }

    alert('삭제되었습니다.');
    router.push('/ips');
  };

  if (loading) {
    return <div style={styles.page}>불러오는 중...</div>;
  }

  if (!ip) {
    return <div style={styles.page}>IP 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => router.back()}>
            ← 뒤로가기
          </button>

          <div style={styles.actions}>
            <Link href={`/ips/${ip.id}/edit`} style={styles.editButton}>
              수정
            </Link>

            <button style={styles.deleteButton} onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>

        <h1 style={styles.title}>{ip.name}</h1>

        <div style={styles.infoList}>
          <div style={styles.infoRow}>
            <span style={styles.label}>영문명</span>
            <span>{ip.englishName || '-'}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>원어명</span>
            <span>{ip.originalName || '-'}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>상태</span>
            <span>{ip.status}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>공식 링크</span>
            {ip.officialUrl ? (
              <a
                href={ip.officialUrl}
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
            <span>{formatDate(ip.createdAt)}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>수정일</span>
            <span>{formatDate(ip.updatedAt)}</span>
          </div>
        </div>

        <div style={styles.descriptionBox}>
          <h2 style={styles.subTitle}>설명</h2>
          <p style={styles.description}>
            {ip.description || '등록된 설명이 없습니다.'}
          </p>
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

const styles: { [key: string]: React.CSSProperties } = {
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
    marginBottom: 28,
    fontSize: 24,
    fontWeight: 700,
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
    color: '#666',
    fontWeight: 600,
    flexShrink: 0,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  descriptionBox: {
    marginTop: 28,
  },
  subTitle: {
    fontSize: 17,
    marginBottom: 10,
  },
  description: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    color: '#333',
  },
};