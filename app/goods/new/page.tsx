'use client';

import { useEffect, useMemo, useState } from 'react';

type IpItem = {
  id: number;
  name: string;
};

type IpEventItem = {
  id: number;
  ipId: number;
  name: string;
};

export default function GoodsCreatePage() {
  const [ipList, setIpList] = useState<IpItem[]>([]);
  const [ipEventList, setIpEventList] = useState<IpEventItem[]>([]);

  const [ipId, setIpId] = useState('');
  const [ipEventId, setIpEventId] = useState('');
  const [name, setName] = useState('');
  const [goodsType, setGoodsType] = useState('');
  const [officialPrice, setOfficialPrice] = useState('');
  const [isNotForSale, setIsNotForSale] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const filteredIpEventList = useMemo(() => {
    if(!ipId) {
      return [];
    }

    return ipEventList.filter((ipEvent) => String(ipEvent.ipId) === ipId);
  }, [ipEventList, ipId]);

  const displayOfficialPrice =
    officialPrice === '' ? '' : Number(officialPrice).toLocaleString('ko-KR');

  const handleChangeOfficialPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
    setOfficialPrice(rawValue);
  };

  const handleChangeIsNotForSale = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsNotForSale(checked);

    if(checked) {
      setOfficialPrice('');
    }
  };

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

  const getIpEventList = async () => {
    try {
      const response = await fetch('/api/ip-events', {
        method: 'GET',
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || 'IP 이벤트 목록을 불러오지 못했습니다.');
        return;
      }

      const normalizedList = data.map((ipEvent: any) => ({
        id: ipEvent.id,
        ipId: ipEvent.ipId,
        name: ipEvent.name,
      }));

      setIpEventList(normalizedList);
    } catch {
      setMessage('IP 이벤트 목록 조회 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    getIpList();
    getIpEventList();
  }, []);

  const handleChangeIp = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIpId(event.target.value);
    setIpEventId('');
  };

  const handleSubmit = async () => {
    if(!ipId || !name) {
      setMessage('IP와 굿즈 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/goods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipId,
          ipEventId,
          name,
          goodsType,
          officialPrice: isNotForSale ? null : officialPrice === '' ? null : Number(officialPrice),
          isNotForSale,
          releaseDate,
          officialUrl,
          thumbnailImageUrl,
          description,
        }),
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || '굿즈 등록에 실패했습니다.');
        return;
      }

      setMessage('굿즈가 등록되었습니다.');
      setIpId('');
      setIpEventId('');
      setName('');
      setGoodsType('');
      setOfficialPrice('');
      setIsNotForSale(false);
      setReleaseDate('');
      setOfficialUrl('');
      setThumbnailImageUrl('');
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
        <h1 style={styles.title}>굿즈 등록</h1>

        <div style={styles.field}>
          <label style={styles.label}>IP</label>
          <select
            style={styles.input}
            value={ipId}
            onChange={handleChangeIp}
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
          <label style={styles.label}>IP 이벤트</label>
          <select
            style={styles.input}
            value={ipEventId}
            onChange={(event) => setIpEventId(event.target.value)}
          >
            <option value="">선택 안 함</option>
            {filteredIpEventList.map((ipEvent) => (
              <option key={ipEvent.id} value={ipEvent.id}>
                {ipEvent.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>굿즈 이름</label>
          <input
            style={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 아크릴 스탠드"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>굿즈 종류</label>
          <input
            style={styles.input}
            value={goodsType}
            onChange={(event) => setGoodsType(event.target.value)}
            placeholder="예: 피규어, 아크릴, 포토카드"
          />
        </div>

        <div style={styles.checkboxField}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isNotForSale}
              onChange={handleChangeIsNotForSale}
            />
            비매품
          </label>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>공식 가격</label>
          <input
            type="text"
            style={{
              ...styles.input,
              ...styles.priceInput,
              ...(isNotForSale ? styles.disabledInput : {}),
            }}
            value={displayOfficialPrice}
            onChange={handleChangeOfficialPrice}
            placeholder="예: 15,000"
            disabled={isNotForSale}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>출시일</label>
          <input
            type="date"
            style={styles.input}
            value={releaseDate}
            onChange={(event) => setReleaseDate(event.target.value)}
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
          <label style={styles.label}>썸네일 이미지 URL</label>
          <input
            style={styles.input}
            value={thumbnailImageUrl}
            onChange={(event) => setThumbnailImageUrl(event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>설명</label>
          <textarea
            style={styles.textarea}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="굿즈 설명을 입력해주세요."
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
    width: 480,
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
  checkboxField: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
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
  priceInput: {
    textAlign: 'left',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    cursor: 'not-allowed',
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