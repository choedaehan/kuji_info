'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type GoodsDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type GoodsDetail = {
  id: number;
  name: string;
  officialPrice: number | null;
  releaseDate?: string | null;
  officialUrl?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  ip?: {
    id: number;
    name: string;
  } | null;
  ipEvent?: {
    id: number;
    name: string;
  } | null;
};

export default function GoodsDetailPage({
  params,
}: GoodsDetailPageProps) {
  const router = useRouter();

  const [goodsId, setGoodsId] = useState<number | null>(null);
  const [goods, setGoods] = useState<GoodsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getGoodsDetail = async (id: string) => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(`/api/goods/${id}`, {
        method: 'GET',
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || '굿즈 정보를 불러오지 못했습니다.');
        return;
      }

      setGoods(data);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(!goodsId) {
      return;
    }

    const confirmed = window.confirm('정말 이 굿즈를 삭제하시겠습니까?');

    if(!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setMessage('');

      const response = await fetch(`/api/goods/${goodsId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || '굿즈 삭제에 실패했습니다.');
        return;
      }

      router.push('/goods');
      router.refresh();
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;

      if(!id || Number.isNaN(Number(id))) {
        setMessage('유효하지 않은 굿즈 ID입니다.');
        setLoading(false);
        return;
      }

      setGoodsId(Number(id));
      await getGoodsDetail(id);
    };

    init();
  }, [params]);

  if(loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>로딩 중...</div>
      </div>
    );
  }

  if(!goods) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.message}>{message || '굿즈 정보를 찾을 수 없습니다.'}</div>

          <div style={styles.headerButtonGroup}>
            <Link href="/goods" style={styles.linkButton}>
              목록
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>굿즈 상세</h1>
            <p style={styles.subText}>ID: {goods.id}</p>
          </div>

          <div style={styles.headerButtonGroup}>
            <Link href="/goods" style={styles.linkButton}>
              목록
            </Link>

            <Link
              href={`/goods/${goods.id}/edit`}
              style={styles.editButton}
            >
              수정
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              style={{
                ...styles.deleteButton,
                opacity: deleteLoading ? 0.6 : 1,
                cursor: deleteLoading ? 'default' : 'pointer',
              }}
            >
              {deleteLoading ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>

        {message ? <div style={styles.message}>{message}</div> : null}

        <div style={styles.detailBox}>
          <DetailRow label="상품명" value={goods.name} />
          <DetailRow label="IP" value={goods.ip?.name ?? '-'} />
          <DetailRow label="이벤트" value={goods.ipEvent?.name ?? '-'} />
          <DetailRow
            label="가격"
            value={
              typeof goods.officialPrice === 'number'
                ? `${goods.officialPrice.toLocaleString()}원`
                : '-'
            }
          />
          <DetailRow
            label="발매일"
            value={goods.releaseDate ? formatDate(goods.releaseDate) : '-'}
          />
          <DetailRow
            label="공식 링크"
            value={
              goods.officialUrl ? (
                <a
                  href={goods.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.urlLink}
                >
                  {goods.officialUrl}
                </a>
              ) : (
                '-'
              )
            }
          />
          <DetailRow
            label="설명"
            value={goods.description || '-'}
            multiline
          />
          <DetailRow label="등록일" value={formatDateTime(goods.createdAt)} />
          <DetailRow label="수정일" value={formatDateTime(goods.updatedAt)} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div style={styles.detailRow}>
      <div style={styles.detailLabel}>{label}</div>
      <div
        style={{
          ...styles.detailValue,
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f8',
    padding: '24px',
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  loadingBox: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '40px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
  },
  subText: {
    margin: '8px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },
  headerButtonGroup: {
    display: 'flex',
    gap: '8px',
  },
  linkButton: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    color: '#111827',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#ffffff',
  },
  editButton: {
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#111827',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },
  deleteButton: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #dc2626',
    backgroundColor: '#ffffff',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: 600,
  },
  message: {
    marginBottom: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '14px',
  },
  detailBox: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    borderTop: '1px solid #e5e7eb',
  },
  detailLabel: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    fontWeight: 700,
    color: '#374151',
  },
  detailValue: {
    padding: '16px',
    color: '#111827',
    wordBreak: 'break-word',
  },
  urlLink: {
    color: '#2563eb',
    textDecoration: 'underline',
    wordBreak: 'break-all',
  },
};