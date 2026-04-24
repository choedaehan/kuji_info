'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function IpEditPage() {
  const params = useParams();
  const router = useRouter();

  const ipId = params.id as string;

  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getIp = async () => {
      try {
        const response = await fetch(`/api/ips/${ipId}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || 'IP 정보를 불러오지 못했습니다.');
          return;
        }

        setName(data.name ?? '');
        setEnglishName(data.englishName ?? '');
        setOriginalName(data.originalName ?? '');
        setOfficialUrl(data.officialUrl ?? '');
        setDescription(data.description ?? '');
        setStatus(data.status ?? 'ACTIVE');
      } catch {
        setMessage('IP 조회 중 오류가 발생했습니다.');
      }
    };

    if (ipId) {
      getIp();
    }
  }, [ipId]);

  const handleSubmit = async () => {
    if (!name) {
      setMessage('IP 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/ips/${ipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          englishName,
          originalName,
          officialUrl,
          description,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'IP 수정에 실패했습니다.');
        return;
      }

      alert('IP가 수정되었습니다.');
      router.push(`/ips/${ipId}`);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>IP 수정</h1>

        <div style={styles.field}>
          <label style={styles.label}>IP 이름</label>
          <input
            style={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 하이큐"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>영문명</label>
          <input
            style={styles.input}
            value={englishName}
            onChange={(event) => setEnglishName(event.target.value)}
            placeholder="예: Haikyuu"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>원어명</label>
          <input
            style={styles.input}
            value={originalName}
            onChange={(event) => setOriginalName(event.target.value)}
            placeholder="예: ハイキュー!!"
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

        <div style={styles.field}>
          <label style={styles.label}>상태</label>
          <select
            style={styles.input}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>설명</label>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="IP 설명을 입력해주세요."
          />
        </div>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '수정 중...' : '수정'}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
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
    marginBottom: 24,
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
  textarea: {
    width: '100%',
    minHeight: 100,
    padding: 12,
    borderRadius: 6,
    border: '1px solid #dcdfe3',
    fontSize: 14,
    resize: 'vertical',
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