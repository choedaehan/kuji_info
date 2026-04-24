'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface IpEvent {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string | null;
  officialUrl: string | null;
  createdAt: string;
}

export default function IpEventsPage() {
  const router = useRouter();

  const [eventList, setEventList] = useState<IpEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getIpEventList = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/ip-events', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '이벤트 목록을 불러오지 못했습니다.');
        return;
      }

      setEventList(data);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIpEventList();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>이벤트 목록</h1>
          <p style={styles.description}>등록된 이벤트를 확인할 수 있습니다.</p>
        </div>

        <button
          type="button"
          style={styles.createButton}
          onClick={() => router.push('/ip-events/new')}
        >
          이벤트 등록
        </button>
      </div>

      {message ? <div style={styles.message}>{message}</div> : null}

      {loading ? (
        <div style={styles.loading}>로딩중...</div>
      ) : eventList.length === 0 ? (
        <div style={styles.emptyBox}>등록된 이벤트가 없습니다.</div>
      ) : (
        <div style={styles.list}>
          {eventList.map((event) => (
            <div
              key={event.id}
              style={styles.item}
              onClick={() => router.push(`/ip-events/${event.id}`)}
            >
              <div style={styles.itemTitle}>{event.name}</div>

              <div style={styles.metaRow}>
                <span style={styles.label}>기간</span>
                <span style={styles.value}>
                  {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                </span>
              </div>

              {event.location ? (
                <div style={styles.metaRow}>
                  <span style={styles.label}>장소</span>
                  <span style={styles.value}>{event.location}</span>
                </div>
              ) : null}

              {event.officialUrl && (
                <div style={styles.metaRow}>
                    <span style={styles.label}>공식 링크</span>

                    <button
                    type="button"
                    onClick={(eventClick) => {
                      eventClick.stopPropagation();
                      if (!event.officialUrl) return;

                      window.open(event.officialUrl, '_blank');
                      }}
                      style={styles.linkButton}
                    >
                    공식 링크 이동
                    </button>
                </div>
                )}

              <div style={styles.createdAt}>
                등록일: {formatDateTime(event.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
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
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
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
  linkText: {
    color: '#2563eb',
    wordBreak: 'break-all',
  },
  createdAt: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '13px',
    color: '#6b7280',
  },
  linkButton: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #2563eb',
    backgroundColor: '#ffffff',
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    },
};