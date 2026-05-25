'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ManufacturerCreatePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setMessage('제조사명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          officialUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '제조사 등록에 실패했습니다.');
        return;
      }

      router.push('/companies');
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>제조사 등록</h1>

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
          {loading ? '등록 중...' : '등록'}
        </button>

        {message ? <p style={styles.message}>{message}</p> : null}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 0',
  },
  card: {
    width: 420,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
