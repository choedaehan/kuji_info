'use client';

import { KUJI_GRADE_OPTIONS } from '@/lib/kuji';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type IpItem = {
  id: number;
  name: string;
};

type LineupInput = {
  id: number | null;
  goodsId: number | null;
  prizeName: string;
  prizeType: string;
  grade: string;
  quantity: string;
};

type KujiResponse = {
  ipId: number;
  name: string;
  japanPricePerTry: number | null;
  koreaPricePerTry: number | null;
  totalCount: number | null;
  japanReleaseDate: string | null;
  koreaReleaseDate: string | null;
  officialUrl: string | null;
  description: string | null;
  lineups: {
    id: number;
    goodsId: number | null;
    prizeName: string | null;
    prizeType: string | null;
    grade: string | null;
    quantity: number | null;
  }[];
};

const emptyLineup: LineupInput = {
  id: null,
  goodsId: null,
  prizeName: '',
  prizeType: '',
  grade: '',
  quantity: '',
};

export default function KujiEditPage() {
  const params = useParams();
  const router = useRouter();
  const kujiId = params.id as string;

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
    const getInitialData = async () => {
      try {
        setMessage('');

        const [ipResponse, kujiResponse] = await Promise.all([
          fetch('/api/ips'),
          fetch(`/api/kujis/${kujiId}`),
        ]);
        const [ipData, kujiData] = await Promise.all([
          ipResponse.json(),
          kujiResponse.json(),
        ]);

        if (!ipResponse.ok) {
          setMessage(ipData.message || 'IP 목록을 불러오지 못했습니다.');
          return;
        }

        if (!kujiResponse.ok) {
          setMessage(kujiData.message || '쿠지 정보를 불러오지 못했습니다.');
          return;
        }

        const kuji = kujiData as KujiResponse;

        setIpList(ipData);
        setIpId(String(kuji.ipId));
        setName(kuji.name ?? '');
        setJapanPricePerTry(kuji.japanPricePerTry?.toString() ?? '');
        setKoreaPricePerTry(kuji.koreaPricePerTry?.toString() ?? '');
        setTotalCount(kuji.totalCount?.toString() ?? '');
        setJapanReleaseDate(kuji.japanReleaseDate?.slice(0, 10) ?? '');
        setKoreaReleaseDate(kuji.koreaReleaseDate?.slice(0, 10) ?? '');
        setOfficialUrl(kuji.officialUrl ?? '');
        setDescription(kuji.description ?? '');
        setLineups(
          kuji.lineups.length > 0
            ? kuji.lineups.map((lineup) => ({
                id: lineup.id,
                goodsId: lineup.goodsId,
                prizeName: lineup.prizeName ?? '',
                prizeType: lineup.prizeType ?? '',
                grade: lineup.grade ?? '',
                quantity: lineup.quantity?.toString() ?? '',
              }))
            : [emptyLineup]
        );
      } catch {
        setMessage('서버 오류가 발생했습니다.');
      }
    };

    if (kujiId) {
      getInitialData();
    }
  }, [kujiId]);

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

    const submitLineups = lineups
      .filter((lineup) => lineup.prizeName.trim())
      .map((lineup, index) => ({
        id: lineup.id,
        goodsId: lineup.goodsId,
        prizeName: lineup.prizeName,
        prizeType: lineup.prizeType || null,
        grade: lineup.grade || null,
        quantity: lineup.quantity === '' ? null : Number(lineup.quantity),
        sortOrder: index,
      }));

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/kujis/${kujiId}`, {
        method: 'PATCH',
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
        setMessage(data.message || '쿠지 수정에 실패했습니다.');
        return;
      }

      router.push(`/kujis/${kujiId}`);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('쿠지를 삭제할까요? 연결된 라인업도 함께 삭제됩니다.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/kujis/${kujiId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '쿠지 삭제에 실패했습니다.');
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
        <div style={styles.header}>
          <h1 style={styles.title}>쿠지 수정</h1>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => router.push(`/kujis/${kujiId}`)}
              disabled={loading}
            >
              수정 취소
            </button>

            <button
              type="button"
              style={styles.deleteButton}
              onClick={handleDelete}
              disabled={loading}
            >
              쿠지 삭제
            </button>
          </div>
        </div>

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
              <div key={`${lineup.id ?? 'new'}-${index}`} style={styles.lineupItem}>
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
    width: 640,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelButton: {
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
  deleteButton: {
    height: 36,
    padding: '0 12px',
    borderRadius: 6,
    border: '1px solid #fecaca',
    backgroundColor: '#ffffff',
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
  },
};
