'use client';

import { KUJI_GRADE_OPTIONS } from '@/lib/kuji';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type IpItem = {
  id: number;
  name: string;
};

type LineupInput = {
  prizeName: string;
  prizeType: string;
  grade: string;
  quantity: string;
};

const emptyLineup: LineupInput = {
  prizeName: '',
  prizeType: '',
  grade: '',
  quantity: '',
};

export default function KujiCreatePage() {
  const router = useRouter();

  const [ipList, setIpList] = useState<IpItem[]>([]);
  const [ipId, setIpId] = useState('');
  const [name, setName] = useState('');
  const [japanPricePerTry, setJapanPricePerTry] = useState('');
  const [koreaPricePerTry, setKoreaPricePerTry] = useState('');
  const [totalCount, setTotalCount] = useState('');
  const [japanReleaseDate, setJapanReleaseDate] = useState('');
  const [koreaReleaseDate, setKoreaReleaseDate] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [description, setDescription] = useState('');
  const [lineups, setLineups] = useState<LineupInput[]>([emptyLineup]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const displayJapanPricePerTry =
    japanPricePerTry === '' ? '' : Number(japanPricePerTry).toLocaleString('ko-KR');
  const displayKoreaPricePerTry =
    koreaPricePerTry === '' ? '' : Number(koreaPricePerTry).toLocaleString('ko-KR');

  useEffect(() => {
    const getIpList = async () => {
      try {
        const response = await fetch('/api/ips');
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || 'IP 목록을 불러오지 못했습니다.');
          return;
        }

        setIpList(data);
      } catch {
        setMessage('IP 목록 조회 중 오류가 발생했습니다.');
      }
    };

    getIpList();
  }, []);

  const handleAddLineup = () => {
    setLineups((prevLineups) => [...prevLineups, emptyLineup]);
  };

  const handleRemoveLineup = (index: number) => {
    setLineups((prevLineups) => prevLineups.filter((_, lineupIndex) => lineupIndex !== index));
  };

  const handleChangeLineup = (
    index: number,
    field: keyof LineupInput,
    value: string
  ) => {
    setLineups((prevLineups) =>
      prevLineups.map((lineup, lineupIndex) =>
        lineupIndex === index
          ? {
              ...lineup,
              [field]: value,
            }
          : lineup
      )
    );
  };

  const handleSubmit = async () => {
    if (!ipId || !name.trim()) {
      setMessage('IP와 쿠지 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    const submitLineups = lineups
      .filter((lineup) => lineup.prizeName.trim())
      .map((lineup, index) => ({
        prizeName: lineup.prizeName,
        prizeType: lineup.prizeType || null,
        grade: lineup.grade || null,
        quantity: lineup.quantity === '' ? null : Number(lineup.quantity),
        sortOrder: index,
      }));

    try {
      const response = await fetch('/api/kujis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipId: Number(ipId),
          name,
          japanPricePerTry,
          koreaPricePerTry,
          totalCount,
          japanReleaseDate,
          koreaReleaseDate,
          officialUrl,
          description,
          lineups: submitLineups,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '쿠지 등록에 실패했습니다.');
        return;
      }

      router.push('/kujis');
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>쿠지 등록</h1>

        <div style={styles.field}>
          <label style={styles.label}>
            IP <span style={styles.requiredMark}>*</span>
          </label>
          <select style={styles.input} value={ipId} onChange={(event) => setIpId(event.target.value)}>
            <option value="">IP를 선택해주세요.</option>
            {ipList.map((ip) => (
              <option key={ip.id} value={ip.id}>
                {ip.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            쿠지 이름 <span style={styles.requiredMark}>*</span>
          </label>
          <input
            style={styles.input}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 니케 1번 쿠지"
          />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>일본 회당 가격</label>
            <input
              style={styles.input}
              value={displayJapanPricePerTry}
              onChange={(event) => setJapanPricePerTry(event.target.value.replace(/,/g, '').replace(/[^0-9]/g, ''))}
              placeholder="예: 850"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>국내 회당 가격</label>
            <input
              style={styles.input}
              value={displayKoreaPricePerTry}
              onChange={(event) => setKoreaPricePerTry(event.target.value.replace(/,/g, '').replace(/[^0-9]/g, ''))}
              placeholder="예: 12000"
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>총 개수</label>
          <input
            style={styles.input}
            value={totalCount}
            onChange={(event) => setTotalCount(event.target.value.replace(/[^0-9]/g, ''))}
            placeholder="예: 80"
          />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>일본 출시일</label>
            <input
              type="date"
              style={styles.input}
              value={japanReleaseDate}
              onChange={(event) => setJapanReleaseDate(event.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>국내 출시일</label>
            <input
              type="date"
              style={styles.input}
              value={koreaReleaseDate}
              onChange={(event) => setKoreaReleaseDate(event.target.value)}
            />
          </div>
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
            placeholder="쿠지 설명을 입력해주세요."
          />
        </div>

        <div style={styles.lineupSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>라인업</h2>
            <button type="button" style={styles.secondaryButton} onClick={handleAddLineup}>
              라인업 추가
            </button>
          </div>

          <div style={styles.lineupList}>
            {lineups.map((lineup, index) => (
              <div key={index} style={styles.lineupItem}>
                <div style={styles.lineupTopFields}>
                  <div style={styles.field}>
                    <label style={styles.label}>등급</label>
                    <select
                      style={styles.input}
                      value={lineup.grade}
                      onChange={(event) => handleChangeLineup(index, 'grade', event.target.value)}
                    >
                      <option value="">선택</option>
                      {KUJI_GRADE_OPTIONS.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>타입</label>
                    <input
                      style={styles.input}
                      value={lineup.prizeType}
                      onChange={(event) => handleChangeLineup(index, 'prizeType', event.target.value)}
                      placeholder="예: 피규어"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>수량</label>
                    <input
                      style={styles.input}
                      value={lineup.quantity}
                      onChange={(event) =>
                        handleChangeLineup(index, 'quantity', event.target.value.replace(/[^0-9]/g, ''))
                      }
                      placeholder="예: 2"
                    />
                  </div>
                </div>

                <div style={styles.lineupBottomFields}>
                  <div style={styles.field}>
                    <label style={styles.label}>경품명</label>
                    <input
                      style={styles.input}
                      value={lineup.prizeName}
                      onChange={(event) => handleChangeLineup(index, 'prizeName', event.target.value)}
                      placeholder="예: A상 피규어"
                    />
                  </div>

                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => handleRemoveLineup(index)}
                    disabled={lineups.length === 1}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
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
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '48px 24px',
  },
  card: {
    width: 520,
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
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
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
  requiredMark: {
    color: '#dc2626',
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
  lineupSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  secondaryButton: {
    height: 36,
    padding: '0 12px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  lineupList: {
    display: 'grid',
    gap: 12,
  },
  lineupItem: {
    padding: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  lineupTopFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12,
  },
  lineupBottomFields: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'end',
    gap: 12,
  },
  removeButton: {
    height: 34,
    marginBottom: 16,
    padding: '0 12px',
    borderRadius: 6,
    border: '1px solid #fecaca',
    backgroundColor: '#ffffff',
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
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
