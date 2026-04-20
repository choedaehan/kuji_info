'use client';

import { useEffect, useState } from 'react';

type IpItem = {
  id: number;
  name: string;
};

export default function IpEventCreatePage() {
  const [ipList, setIpList] = useState<IpItem[]>([]);
  const [ipId, setIpId] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getIpList = async () => {
    try {
      const response = await fetch('/api/ip', {
        method: 'GET',
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || 'IP 목록을 불러오지 못했습니다.');
        return;
      }

      setIpList(data);
    } catch {
      setMessage('IP 목록 조회 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    getIpList();
  }, []);

  const handleSubmit = async () => {
    if(!ipId || !name) {
      setMessage('IP와 이벤트 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/ip-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipId,
          name,
          startDate,
          endDate,
          location,
          officialUrl,
          description,
        }),
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || 'IP 이벤트 등록에 실패했습니다.');
        return;
      }

      setMessage('IP 이벤트가 등록되었습니다.');
      setIpId('');
      setName('');
      setStartDate('');
      setEndDate('');
      setLocation('');
      setOfficialUrl('');
      setDescription('');
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>IP 이벤트 등록</h1>

        <div style={styles.field}>
          <label style={styles.label}>IP</label>
          <select
            style={styles.input}
            value={ipId}
            onChange={(event) => setIpId(event.target.value)}
          >
            <option value="">IP를 선택해주세요.</option>
            {ipList.map((ip) => (
              <option key={ip.id} value={ip.id}>
                {ip.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>이벤트 이름</label>
          <input
            style={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 2주년 전시회"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>시작일</label>
          <input
            type="date"
            style={styles.input}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>종료일</label>
          <input
            type="date"
            style={styles.input}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>장소</label>
          <input
            style={styles.input}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="예: 용산 아이파크몰"
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
          <label style={styles.label}>설명</label>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="이벤트 설명을 입력해주세요."
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
          {loading ? '등록 중...' : '등록'}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
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