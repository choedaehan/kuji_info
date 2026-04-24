'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type GoodsItem = {
  id: number;
  name: string;
  goodsType: string | null;
  officialPrice: number | null;
  isNotForSale: Boolean;
  releaseDate: string | null;
  officialUrl: string | null;
  thumbnailImageUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  ip: {
    id: number;
    name: string;
  };
  ipEvent: {
    id: number;
    name: string;
  } | null;
};

export default function GoodsListPage() {
  const router = useRouter();
  const [goodsList, setGoodsList] = useState<GoodsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getGoodsList = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/goods', {
        method: 'GET',
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || '굿즈 목록을 불러오지 못했습니다.');
        return;
      }

      setGoodsList(data);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGoodsList();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>굿즈 목록</h1>
          <a href="/goods/new" style={styles.linkButton}>
            굿즈 등록
          </a>
        </div>

        {loading ? (
          <p style={styles.message}>불러오는 중...</p>
        ) : message ? (
          <p style={styles.message}>{message}</p>
        ) : goodsList.length === 0 ? (
          <p style={styles.message}>등록된 굿즈가 없습니다.</p>
        ) : (
          <div style={styles.list}>
            {goodsList.map((goods) => (
              <div
                key={goods.id}
                style={styles.item}
                onClick={() => router.push(`/goods/${goods.id}`)}
              >
                <div style={styles.leftSection}>
                  {goods.thumbnailImageUrl ? (
                    <img
                      src={goods.thumbnailImageUrl}
                      alt={goods.name}
                      style={styles.thumbnail}
                    />
                  ) : (
                    <div style={styles.emptyThumbnail}>이미지 없음</div>
                  )}

                  <div style={styles.content}>
                    <div style={styles.topRow}>
                      <p style={styles.name}>{goods.name}</p>
                      {goods.goodsType ? (
                        <span style={styles.badge}>{goods.goodsType}</span>
                      ) : null}
                    </div>

                    <p style={styles.meta}>
                      IP: {goods.ip.name}
                    </p>

                    <p style={styles.meta}>
                      이벤트: {goods.ipEvent ? goods.ipEvent.name : '-'}
                    </p>

                    <p style={styles.meta}>
                      공식 가격: {goods.isNotForSale
                        ? '비매품'
                        : goods.officialPrice !== null
                          ? `${goods.officialPrice.toLocaleString('ko-KR')}원`
                          : '-'}
                    </p>

                    <p style={styles.meta}>
                      출시일: {goods.releaseDate
                        ? new Date(goods.releaseDate).toLocaleDateString('ko-KR')
                        : '-'}
                    </p>

                    {goods.description ? (
                      <p style={styles.description}>{goods.description}</p>
                    ) : null}

                    {goods.officialUrl ? (
                      <a
                        href={goods.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.link}
                        onClick={(event) => event.stopPropagation()}
                      >
                        공식 링크 이동
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f8',
    padding: '40px 20px',
  },
  card: {
    maxWidth: 960,
    margin: '0 auto',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: '0 16px',
    borderRadius: 6,
    backgroundColor: '#111827',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  item: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
    cursor: 'pointer',
  },
  leftSection: {
    display: 'flex',
    gap: 16,
  },
  thumbnail: {
    width: 120,
    height: 120,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    flexShrink: 0,
  },
  emptyThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  name: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    padding: '0 10px',
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontSize: 12,
    fontWeight: 600,
  },
  meta: {
    margin: '0 0 6px 0',
    fontSize: 14,
    color: '#4b5563',
  },
  description: {
    margin: '12px 0 0 0',
    fontSize: 14,
    color: '#374151',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  link: {
    display: 'inline-block',
    marginTop: 12,
    fontSize: 14,
    color: '#2563eb',
    textDecoration: 'underline',
  },
  message: {
    fontSize: 14,
    color: '#374151',
  },
};