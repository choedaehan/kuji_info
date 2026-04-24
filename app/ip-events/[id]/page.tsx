'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type IpEvent = {
  id: number;
  name: string;
  description: string | null;
  officialUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const eventId = params.id as string;

  const [event, setEvent] = useState<IpEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/ip-events/${eventId}`);

        if (!response.ok) {
          throw new Error('이벤트 조회 실패');
        }

        const data = await response.json();
        setEvent(data);
      } catch (error) {
        alert('이벤트 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleDelete = async () => {
    const confirmed = confirm('이 이벤트를 삭제하시겠습니까?');

    if (!confirmed) return;

    const response = await fetch(`/api/ip-events/${eventId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        alert('삭제에 실패했습니다.');
        return;
    }

    alert('삭제되었습니다.');
    router.push('/ip-events');
    };

  if (isLoading) {
    return <div style={styles.container}>불러오는 중...</div>;
  }

  if (!event) {
    return (
      <div style={styles.container}>
        <p>이벤트 정보를 찾을 수 없습니다.</p>
        <button style={styles.button} onClick={() => router.back()}>
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => router.back()}>
          ← 뒤로가기
        </button>
        <div>
          <Link href={`/ip-events/${event.id}/edit`} style={styles.editButton}>
            수정
          </Link>
          <button type="button" style={styles.deleteButton} onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>

      <section style={styles.card}>
        <h1 style={styles.title}>{event.name}</h1>

        <div style={styles.infoList}>
          <div style={styles.infoRow}>
            <span style={styles.label}>시작일</span>
            <span>{event.startDate ? formatDate(event.startDate) : '-'}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>종료일</span>
            <span>{event.endDate ? formatDate(event.endDate) : '-'}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>공식 링크</span>
            {event.officialUrl ? (
              <a
                href={event.officialUrl}
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
            <span>{formatDate(event.createdAt)}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.label}>수정일</span>
            <span>{formatDate(event.updatedAt)}</span>
          </div>
        </div>

        <div style={styles.descriptionBox}>
          <h2 style={styles.subTitle}>설명</h2>
          <p style={styles.description}>
            {event.description || '등록된 설명이 없습니다.'}
          </p>
        </div>
      </section>
    </main>
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
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    border: '1px solid #ddd',
    background: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  editButton: {
    background: '#111',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
  },
  card: {
    border: '1px solid #e5e5e5',
    borderRadius: 16,
    padding: 32,
    background: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 28px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 32,
  },
  infoRow: {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: 14,
    fontSize: 15,
  },
  label: {
    width: 120,
    color: '#666',
    fontWeight: 600,
    flexShrink: 0,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  descriptionBox: {
    marginTop: 24,
  },
  subTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    color: '#333',
  },
  button: {
    border: '1px solid #ddd',
    background: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: 8,
    },
    deleteButton: {
    background: '#dc2626',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
    },
};