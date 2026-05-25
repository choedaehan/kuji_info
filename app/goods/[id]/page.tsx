'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type GoodsDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type GoodsItem = {
  id: number;
  name: string;
  characterName: string | null;
  imageUrl: string | null;
  rarity: string | null;
  dropRate: number | null;
  sortOrder: number;
};

type GoodsDetail = {
  id: number;
  name: string;
  goodsType: string | null;
  saleType: string;
  officialPrice: number | null;
  isNotForSale: boolean;
  releaseDate?: string | null;
  officialUrl?: string | null;
  thumbnailImageUrl?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  ip?: {
    id: number;
    name: string;
  } | null;
  company?: {
    id: number;
    name: string;
  } | null;
  eventGoods: {
    event: {
      id: number;
      name: string;
    };
  }[];
  kujiLineups: {
    id: number;
    prizeName: string | null;
    prizeType: string | null;
    grade: string | null;
    quantity: number | null;
    kuji: {
      id: number;
      name: string;
    };
  }[];
  goodsItems: GoodsItem[];
};

export default function GoodsDetailPage({ params }: GoodsDetailPageProps) {
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
          <div style={styles.message}>
            {message || '굿즈 정보를 찾을 수 없습니다.'}
          </div>

          <div style={styles.headerButtonGroup}>
            <Link href="/goods" style={styles.linkButton}>
              목록
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const eventNames = goods.eventGoods.map((eventGoods) => eventGoods.event.name);
  const kujiLineupNames = goods.kujiLineups.map((lineup) =>
    `${lineup.kuji.name} / ${lineup.grade || '-'} / ${lineup.prizeType || '-'} / ${lineup.prizeName || goods.name}`
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <Link href="/goods" style={styles.backLink}>
              ← 목록
            </Link>
            <h1 style={styles.title}>굿즈 상세</h1>
            <p style={styles.subText}>ID: {goods.id}</p>
          </div>

          <div style={styles.headerButtonGroup}>
            <Link href={`/goods/${goods.id}/edit`} style={styles.editButton}>
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
          <DetailRow label="제조사" value={goods.company?.name ?? '-'} />
          <DetailRow
            label="이벤트"
            value={eventNames.length > 0 ? eventNames.join(', ') : '-'}
          />
          <DetailRow
            label="쿠지 라인업"
            value={kujiLineupNames.length > 0 ? kujiLineupNames.join(', ') : '-'}
          />
          <DetailRow label="굿즈 종류" value={goods.goodsType || '-'} />
          <DetailRow label="판매 방식" value={getSaleTypeLabel(goods.saleType)} />
          <DetailRow
            label="가격"
            value={
              goods.isNotForSale
                ? '비매품'
                : typeof goods.officialPrice === 'number'
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
                  공식 링크 이동
                </a>
              ) : (
                '-'
              )
            }
          />
          <DetailRow
            label="썸네일"
            value={
              goods.thumbnailImageUrl ? (
                <a
                  href={goods.thumbnailImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.urlLink}
                >
                  이미지 링크 이동
                </a>
              ) : (
                '-'
              )
            }
          />
          <DetailRow label="설명" value={goods.description || '-'} multiline />
          <DetailRow label="등록일" value={formatDateTime(goods.createdAt)} />
          <DetailRow label="수정일" value={formatDateTime(goods.updatedAt)} />
        </div>

        <div style={styles.itemSection}>
          <h2 style={styles.sectionTitle}>굿즈 아이템</h2>

          {goods.goodsItems.length === 0 ? (
            <div style={styles.emptyBox}>등록된 굿즈 아이템이 없습니다.</div>
          ) : (
            <div style={styles.itemList}>
              {goods.goodsItems.map((item) => (
                <div key={item.id} style={styles.itemCard}>
                  <div style={styles.itemName}>{item.name}</div>

                  <div style={styles.itemInfo}>
                    <span style={styles.itemLabel}>캐릭터</span>
                    <span>{item.characterName || '-'}</span>
                  </div>

                  <div style={styles.itemInfo}>
                    <span style={styles.itemLabel}>레어도</span>
                    <span>{item.rarity || '-'}</span>
                  </div>

                  <div style={styles.itemInfo}>
                    <span style={styles.itemLabel}>확률</span>
                    <span>
                      {typeof item.dropRate === 'number'
                        ? `${item.dropRate}%`
                        : '-'}
                    </span>
                  </div>

                  <div style={styles.itemInfo}>
                    <span style={styles.itemLabel}>이미지</span>
                    {item.imageUrl ? (
                      <a
                        href={item.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.urlLink}
                      >
                        이미지 링크 이동
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

function getSaleTypeLabel(value: string) {
  if(value === 'SINGLE') return '단일';
  if(value === 'SELECTABLE') return '선택 구매';
  if(value === 'RANDOM') return '랜덤';

  return value;
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
    backgroundColor: '#ffffff',
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
  backLink: {
    display: 'inline-block',
    marginBottom: '12px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
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
    backgroundColor: '#ffffff',
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
  itemSection: {
    marginTop: '32px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 16px',
  },
  emptyBox: {
    padding: '24px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    color: '#6b7280',
    textAlign: 'center',
  },
  itemList: {
    display: 'grid',
    gap: '12px',
  },
  itemCard: {
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '12px',
  },
  itemInfo: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr',
    gap: '8px',
    fontSize: '14px',
    marginTop: '8px',
  },
  itemLabel: {
    color: '#6b7280',
    fontWeight: 600,
  },
};
