'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type KujiDetail = {
  id: number;
  name: string;
  japanPricePerTry: number | null;
  koreaPricePerTry: number | null;
  totalCount: number | null;
  japanReleaseDate: string | null;
  koreaReleaseDate: string | null;
  officialUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  ip: {
    id: number;
    name: string;
  };
  lineups: {
    id: number;
    prizeName: string | null;
    prizeType: string | null;
    grade: string | null;
    quantity: number | null;
    sortOrder: number;
    goods: {
      id: number;
      name: string;
    } | null;
  }[];
};

export default function KujiDetailPage() {
  const params = useParams();
  const router = useRouter();

  const kujiId = params.id as string;

  const [kuji, setKuji] = useState<KujiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getKuji = async () => {
      try {
        setLoading(true);
        setMessage('');

        const response = await fetch(`/api/kujis/${kujiId}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || '쿠지 정보를 불러오지 못했습니다.');
          return;
        }

        setKuji(data);
      } catch {
        setMessage('서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (kujiId) {
      getKuji();
    }
  }, [kujiId]);

  const handleDelete = async () => {
    if (!kuji) {
      return;
    }

    const confirmed = window.confirm('쿠지를 삭제할까요? 연결된 라인업도 함께 삭제됩니다.');

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setMessage('');

      const response = await fetch(`/api/kujis/${kuji.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || '쿠지 삭제에 실패했습니다.');
        return;
      }

      router.push('/kujis');
      router.refresh();
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.page}>불러오는 중...</div>;
  }

  if (message || !kuji) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <button type="button" style={styles.backButton} onClick={() => router.back()}>
            뒤로가기
          </button>
          <p style={styles.message}>{message || '쿠지 정보를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topActions}>
          <Link href="/kujis" style={styles.backLink}>
            ← 목록
          </Link>

          <div style={styles.actionGroup}>
            <Link href={`/kujis/${kuji.id}/edit`} style={styles.editLink}>
              수정
            </Link>

            <button
              type="button"
              style={{
                ...styles.deleteButton,
                opacity: deleteLoading ? 0.6 : 1,
              }}
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>

        <h1 style={styles.title}>{kuji.name}</h1>

        <div style={styles.infoList}>
          <InfoRow label="IP" value={kuji.ip.name} />
          <InfoRow label="일본 가격" value={formatPrice(kuji.japanPricePerTry)} />
          <InfoRow label="국내 가격" value={formatPrice(kuji.koreaPricePerTry)} />
          <InfoRow label="총 개수" value={kuji.totalCount?.toLocaleString('ko-KR') ?? '-'} />
          <InfoRow label="일본 출시일" value={formatDate(kuji.japanReleaseDate)} />
          <InfoRow label="국내 출시일" value={formatDate(kuji.koreaReleaseDate)} />
          <InfoRow
            label="공식 링크"
            value={
              kuji.officialUrl ? (
                <a href={kuji.officialUrl} target="_blank" rel="noreferrer" style={styles.link}>
                  공식 링크 이동
                </a>
              ) : (
                '-'
              )
            }
          />
          <InfoRow label="설명" value={kuji.description || '-'} />
        </div>

        <div style={styles.lineupSection}>
          <h2 style={styles.sectionTitle}>라인업</h2>

          {kuji.lineups.length === 0 ? (
            <div style={styles.emptyBox}>등록된 라인업이 없습니다.</div>
          ) : (
            <div style={styles.lineupList}>
              {kuji.lineups.map((lineup) => (
                <div key={lineup.id} style={styles.lineupItem}>
                  <strong>{lineup.goods?.name ?? lineup.prizeName ?? '-'}</strong>
                  <span style={styles.lineupMeta}>
                    {lineup.grade || '-'} · {lineup.prizeType || '-'} · 수량 {lineup.quantity ?? '-'}
                    {lineup.goods ? ' · 굿즈 연결됨' : ' · 미연결'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

function formatPrice(value: number | null) {
  return typeof value === 'number' ? value.toLocaleString('ko-KR') : '-';
}

function formatDate(value: string | null) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  card: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  backLink: {
    display: 'inline-block',
    color: '#374151',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  editLink: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    color: '#111827',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  },
  actionGroup: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  deleteButton: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #fecaca',
    backgroundColor: '#ffffff',
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  backButton: {
    border: '1px solid #dcdfe3',
    backgroundColor: '#ffffff',
    padding: '9px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  title: {
    margin: '0 0 28px 0',
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
    width: 110,
    color: '#666666',
    fontWeight: 600,
    flexShrink: 0,
  },
  value: {
    color: '#111827',
    wordBreak: 'break-all',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  lineupSection: {
    marginTop: 28,
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: 18,
    fontWeight: 700,
  },
  emptyBox: {
    padding: '32px 20px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#fafafa',
  },
  lineupList: {
    display: 'grid',
    gap: 10,
  },
  lineupItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },
  lineupMeta: {
    flexShrink: 0,
    color: '#6b7280',
    fontSize: 13,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: '#374151',
  },
};
