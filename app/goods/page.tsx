'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type GoodsItem = {
  id: number;
  name: string;
  goodsType: string | null;
  officialPrice: number | null;
  isNotForSale: boolean;
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
  company: {
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
    grade: string | null;
    prizeName: string | null;
    prizeType: string | null;
    kuji: {
      id: number;
      name: string;
    };
  }[];
};

type FilterOption = {
  id: number;
  name: string;
  ipId?: number;
};

type GoodsFilter = {
  ipId: string;
  companyId: string;
  eventId: string;
  kujiId: string;
  saleType: string;
  isNotForSale: string;
  goodsType: string;
};

type GoodsListResponse = {
  items: GoodsItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

const emptyFilter: GoodsFilter = {
  ipId: '',
  companyId: '',
  eventId: '',
  kujiId: '',
  saleType: '',
  isNotForSale: '',
  goodsType: '',
};

export default function GoodsListPage() {
  const router = useRouter();

  const [goodsList, setGoodsList] = useState<GoodsItem[]>([]);
  const [ipList, setIpList] = useState<FilterOption[]>([]);
  const [companyList, setCompanyList] = useState<FilterOption[]>([]);
  const [eventList, setEventList] = useState<FilterOption[]>([]);
  const [kujiList, setKujiList] = useState<FilterOption[]>([]);
  const [filters, setFilters] = useState<GoodsFilter>(emptyFilter);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const getGoodsList = useCallback(async (
    nextFilters: GoodsFilter,
    nextPage = 1
  ) => {
    try {
      setLoading(true);
      setMessage('');

      const searchParams = new URLSearchParams();

      Object.entries(nextFilters).forEach(([key, value]) => {
        if(value) {
          searchParams.set(key, value);
        }
      });

      searchParams.set('page', String(nextPage));
      searchParams.set('pageSize', String(pageSize));

      const queryString = searchParams.toString();
      const response = await fetch(`/api/goods${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || '굿즈 목록을 불러오지 못했습니다.');
        return;
      }

      const result = data as GoodsListResponse;

      setGoodsList(result.items);
      setPage(result.pagination.page);
      setTotalCount(result.pagination.totalCount);
      setTotalPages(result.pagination.totalPages);
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const getFilterOptions = async () => {
    try {
      const [ipResponse, companyResponse, eventResponse, kujiResponse] = await Promise.all([
        fetch('/api/ips'),
        fetch('/api/companies'),
        fetch('/api/ip-events'),
        fetch('/api/kujis'),
      ]);

      const [ipData, companyData, eventData, kujiData] = await Promise.all([
        ipResponse.json(),
        companyResponse.json(),
        eventResponse.json(),
        kujiResponse.json(),
      ]);

      if(ipResponse.ok) {
        setIpList(ipData);
      }

      if(companyResponse.ok) {
        setCompanyList(companyData);
      }

      if(eventResponse.ok) {
        setEventList(eventData);
      }

      if(kujiResponse.ok) {
        setKujiList(kujiData);
      }
    } catch {
      setMessage('검색 필터 정보를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    getGoodsList(emptyFilter);
    getFilterOptions();
  }, [getGoodsList]);

  const handleChangeFilter = (key: keyof GoodsFilter, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
      ...(key === 'ipId' ? { eventId: '', kujiId: '' } : {}),
      ...(key === 'eventId' && value ? { kujiId: '' } : {}),
      ...(key === 'kujiId' && value ? { eventId: '' } : {}),
    }));
  };

  const filteredEventList = useMemo(() => {
    if(!filters.ipId) {
      return eventList;
    }

    return eventList.filter((event) => String(event.ipId) === filters.ipId);
  }, [eventList, filters.ipId]);

  const filteredKujiList = useMemo(() => {
    if(!filters.ipId) {
      return kujiList;
    }

    return kujiList.filter((kuji) => String(kuji.ipId) === filters.ipId);
  }, [kujiList, filters.ipId]);

  const handleSearch = () => {
    getGoodsList(filters, 1);
  };

  const handleReset = () => {
    setFilters(emptyFilter);
    getGoodsList(emptyFilter, 1);
  };

  const handleChangePage = async (nextPage: number) => {
    await getGoodsList(filters, nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>굿즈 목록</h1>
            <p style={styles.headerDescription}>등록된 굿즈를 확인하고 조건별로 찾을 수 있습니다.</p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.filterButton}
              onClick={() => setFilterOpen((prevOpen) => !prevOpen)}
            >
              검색 필터
            </button>

            <Link href="/goods/new" style={styles.linkButton}>
              굿즈 등록
            </Link>
          </div>
        </div>

        {filterOpen ? (
          <div style={styles.filterPanel}>
            <div style={styles.filterGrid}>
              <div style={styles.field}>
                <label style={styles.label}>IP</label>
                <select
                  style={styles.input}
                  value={filters.ipId}
                  onChange={(event) => handleChangeFilter('ipId', event.target.value)}
                >
                  <option value="">전체</option>
                  {ipList.map((ip) => (
                    <option key={ip.id} value={ip.id}>
                      {ip.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>제조사</label>
                <select
                  style={styles.input}
                  value={filters.companyId}
                  onChange={(event) => handleChangeFilter('companyId', event.target.value)}
                >
                  <option value="">전체</option>
                  {companyList.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>이벤트</label>
                <select
                  style={{
                    ...styles.input,
                    ...(filters.kujiId ? styles.disabledInput : {}),
                  }}
                  value={filters.eventId}
                  onChange={(event) => handleChangeFilter('eventId', event.target.value)}
                  disabled={Boolean(filters.kujiId)}
                >
                  <option value="">전체</option>
                  {filteredEventList.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>쿠지</label>
                <select
                  style={{
                    ...styles.input,
                    ...(filters.eventId ? styles.disabledInput : {}),
                  }}
                  value={filters.kujiId}
                  onChange={(event) => handleChangeFilter('kujiId', event.target.value)}
                  disabled={Boolean(filters.eventId)}
                >
                  <option value="">전체</option>
                  {filteredKujiList.map((kuji) => (
                    <option key={kuji.id} value={kuji.id}>
                      {kuji.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>판매 방식</label>
                <select
                  style={styles.input}
                  value={filters.saleType}
                  onChange={(event) => handleChangeFilter('saleType', event.target.value)}
                >
                  <option value="">전체</option>
                  <option value="SINGLE">단일</option>
                  <option value="SELECTABLE">선택 구매</option>
                  <option value="RANDOM">랜덤</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>비매품 여부</label>
                <select
                  style={styles.input}
                  value={filters.isNotForSale}
                  onChange={(event) => handleChangeFilter('isNotForSale', event.target.value)}
                >
                  <option value="">전체</option>
                  <option value="true">비매품</option>
                  <option value="false">판매품</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>굿즈 종류</label>
                <input
                  style={styles.input}
                  value={filters.goodsType}
                  onChange={(event) => handleChangeFilter('goodsType', event.target.value)}
                  onKeyDown={(event) => {
                    if(event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="예: 아크릴, 피규어"
                />
              </div>
            </div>

            <div style={styles.filterActions}>
              <button type="button" style={styles.searchButton} onClick={handleSearch}>
                검색
              </button>
              <button type="button" style={styles.resetButton} onClick={handleReset}>
                초기화
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div style={styles.loading}>불러오는 중...</div>
        ) : message ? (
          <div style={styles.message}>{message}</div>
        ) : goodsList.length === 0 ? (
          <div style={styles.emptyBox}>등록된 굿즈가 없습니다.</div>
        ) : (
          <>
            <div style={styles.list}>
              {goodsList.map((goods) => {
                const eventNames = goods.eventGoods
                  .map((eventGoods) => eventGoods.event.name)
                  .join(', ');
                const kujiNames = goods.kujiLineups
                  .map((lineup) => {
                    const grade = lineup.grade || '-';
                    const prizeType = lineup.prizeType || '-';
                    const prizeName = lineup.prizeName || goods.name;

                    return `${lineup.kuji.name} / ${grade} / ${prizeType} / ${prizeName}`;
                  })
                  .join(', ');

                return (
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

                        <p style={styles.meta}>IP: {goods.ip.name}</p>

                        <p style={styles.meta}>
                          제조사: {goods.company ? goods.company.name : '-'}
                        </p>

                        <p style={styles.meta}>
                          이벤트: {eventNames || '-'}
                        </p>

                        <p style={styles.meta}>
                          쿠지: {kujiNames || '-'}
                        </p>

                        <p style={styles.meta}>
                          공식 가격:{' '}
                          {goods.isNotForSale
                            ? '비매품'
                            : goods.officialPrice !== null
                              ? `${goods.officialPrice.toLocaleString('ko-KR')}원`
                              : '-'}
                        </p>

                        <p style={styles.meta}>
                          출시일:{' '}
                          {goods.releaseDate
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
                );
              })}
            </div>

            <div style={styles.pagination}>
              <span style={styles.paginationText}>
                총 {totalCount.toLocaleString('ko-KR')}개 · {page} / {totalPages} 페이지
              </span>

              <div style={styles.paginationActions}>
                <button
                  type="button"
                  style={{
                    ...styles.pageButton,
                    ...(page <= 1 ? styles.disabledButton : {}),
                  }}
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page <= 1}
                >
                  이전
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.pageButton,
                    ...(page >= totalPages ? styles.disabledButton : {}),
                  }}
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= totalPages}
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    maxWidth: 960,
    margin: '0 auto',
    backgroundColor: '#ffffff',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
  },
  headerDescription: {
    marginTop: '8px',
    marginBottom: 0,
    fontSize: '14px',
    color: '#666',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: '0 16px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: '0 16px',
    borderRadius: 8,
    backgroundColor: '#111827',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  },
  filterPanel: {
    marginBottom: 24,
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
  },
  field: {
    minWidth: 0,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    width: '100%',
    height: 38,
    padding: '0 10px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  searchButton: {
    height: 38,
    padding: '0 16px',
    border: 'none',
    borderRadius: 8,
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetButton: {
    height: 38,
    padding: '0 16px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#666',
  },
  emptyBox: {
    padding: '48px 24px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#fafafa',
  },
  list: {
    display: 'grid',
    gap: '16px',
  },
  item: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#ffffff',
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
    fontSize: 20,
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
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid #e5e7eb',
  },
  paginationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  paginationActions: {
    display: 'flex',
    gap: 8,
  },
  pageButton: {
    height: 36,
    padding: '0 14px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  disabledButton: {
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    cursor: 'not-allowed',
  },
  message: {
    marginBottom: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '14px',
  },
};
