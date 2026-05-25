'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManufacturerEditPage() {
  const params = useParams();
  const router = useRouter();

  const manufacturerId = params.id as string;

  const [name, setName] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getManufacturer = async () => {
      try {
        const response = await fetch(`/api/companies/${manufacturerId}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || '제조사 정보를 불러오지 못했습니다.');
          return;
        }

        setName(data.name ?? '');
        setOfficialUrl(data.officialUrl ?? '');
      } catch {
        setMessage('서버 오류가 발생했습니다.');
      }
    };

    if (manufacturerId) {
      getManufacturer();
    }
  }, [manufacturerId]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setMessage('제조사명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/companies/${manufacturerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          officialUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '제조사 수정에 실패했습니다.');
        return;
      }

      alert('제조사가 수정되었습니다.');
      router.push(`/companies/${manufacturerId}`);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>제조사 수정</h1>

        <div style={styles.field}>
          <label style={styles.label}>제조사명</label>
          <input
            style={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: Good Smile Company"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>공식 링크</label>
          <input
            style={styles.input}
            value={officialUrl}
            onChange={(event) => setOfficialUrl(event.target.value)}
            placeholder="https://..."
          />
        </div>

        <button
          type="button"
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '수정 중...' : '수정'}
        </button>

        {message ? <p style={styles.message}>{message}</p> : null}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '48px 24px',
  },
  card: {
    width: 420,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  title: {
    margin: '0 0 24px 0',
    fontSize: 20,
    fontWeight: 700,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  input: {
    width: '100%',
    height: 40,
    padding: '0 12px',
    borderRadius: 6,
    border: '1px solid #dcdfe3',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    height: 44,
    marginTop: 8,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
  },
};
