'use client';

import { formatKujiLineupLabel } from '@/lib/kuji';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

type IpEventResponse = {
  id: number;
  ipId: number;
  name: string;
};

type ManufacturerItem = {
  id: number;
  name: string;
};

type KujiItem = {
  id: number;
  ipId: number;
  name: string;
};

type KujiResponse = {
  id: number;
  ipId: number;
  name: string;
};

type KujiLineupItem = {
  id: number;
  prizeName: string | null;
  prizeType: string | null;
  grade: string | null;
  quantity: number | null;
  goodsId: number | null;
  goods: {
    id: number;
    name: string;
  } | null;
};

type KujiDetailResponse = {
  lineups: KujiLineupItem[];
};

type GoodsItemResponse = {
  name?: string | null;
  characterName?: string | null;
  imageUrl?: string | null;
  rarity?: string | null;
  dropRate?: number | null;
};

type GoodsKujiLineupResponse = {
  id: number;
  kujiId: number;
  goodsId: number | null;
  kuji: {
    id: number;
    name: string;
  };
};

type GoodsEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type GoodsItemInput = {
  name: string;
  characterName: string;
  imageUrl: string;
  rarity: string;
  dropRate: string;
};

export default function GoodsEditPage({ params }: GoodsEditPageProps) {
  const router = useRouter();

  const [goodsId, setGoodsId] = useState('');
  const [ipList, setIpList] = useState<IpItem[]>([]);
  const [ipEventList, setIpEventList] = useState<IpEventItem[]>([]);
  const [kujiList, setKujiList] = useState<KujiItem[]>([]);
  const [manufacturerList, setManufacturerList] = useState<ManufacturerItem[]>([]);

  const [ipId, setIpId] = useState('');
  const [eventId, setEventId] = useState('');
  const [kujiId, setKujiId] = useState('');
  const [kujiLineupId, setKujiLineupId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [goodsType, setGoodsType] = useState('');
  const [saleType, setSaleType] = useState('SINGLE');
  const [officialPrice, setOfficialPrice] = useState('');
  const [isNotForSale, setIsNotForSale] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const [items, setItems] = useState<GoodsItemInput[]>([
    {
      name: '',
      characterName: '',
      imageUrl: '',
      rarity: '',
      dropRate: '',
    },
  ]);
  const [kujiLineupList, setKujiLineupList] = useState<KujiLineupItem[]>([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const filteredIpEventList = useMemo(() => {
    if(!ipId) {
      return [];
    }

    return ipEventList.filter((ipEvent) => String(ipEvent.ipId) === ipId);
  }, [ipEventList, ipId]);

  const filteredKujiList = useMemo(() => {
    if(!ipId) {
      return [];
    }

    return kujiList.filter((kuji) => String(kuji.ipId) === ipId);
  }, [kujiList, ipId]);

  const displayOfficialPrice =
    officialPrice === '' ? '' : Number(officialPrice).toLocaleString('ko-KR');

  const handleChangeIp = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIpId(event.target.value);
    setEventId('');
    setKujiId('');
    setKujiLineupId('');
  };

  const handleChangeIpEvent = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEventId = event.target.value;

    setEventId(selectedEventId);

    if(selectedEventId) {
      setKujiId('');
      setKujiLineupId('');
    }
  };

  const handleChangeKuji = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKujiId = event.target.value;

    setKujiId(selectedKujiId);
    setKujiLineupId('');

    if(selectedKujiId) {
      setEventId('');
    }
  };

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

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: '',
        characterName: '',
        imageUrl: '',
        rarity: '',
        dropRate: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleChangeItem = (
    index: number,
    field: keyof GoodsItemInput,
    value: string
  ) => {
    setItems(
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const getIpList = async () => {
    const response = await fetch('/api/ips', {
      method: 'GET',
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.message || 'IP 목록을 불러오지 못했습니다.');
    }

    setIpList(data);
  };

  const getIpEventList = async () => {
    const response = await fetch('/api/ip-events', {
      method: 'GET',
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.message || 'IP 이벤트 목록을 불러오지 못했습니다.');
    }

    const normalizedList = data.map((ipEvent: IpEventResponse) => ({
      id: ipEvent.id,
      ipId: ipEvent.ipId,
      name: ipEvent.name,
    }));

    setIpEventList(normalizedList);
  };

  const getManufacturerList = async () => {
    const response = await fetch('/api/companies', {
      method: 'GET',
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.message || '제조사 목록을 불러오지 못했습니다.');
    }

    setManufacturerList(data);
  };

  const getKujiList = async () => {
    const response = await fetch('/api/kujis', {
      method: 'GET',
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.message || '쿠지 목록을 불러오지 못했습니다.');
    }

    const normalizedList = data.map((kuji: KujiResponse) => ({
      id: kuji.id,
      ipId: kuji.ipId,
      name: kuji.name,
    }));

    setKujiList(normalizedList);
  };

  const getGoodsDetail = async (id: string) => {
    const response = await fetch(`/api/goods/${id}`, {
      method: 'GET',
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.message || '굿즈 정보를 불러오지 못했습니다.');
    }

    setIpId(data.ipId ? String(data.ipId) : '');
    setCompanyId(data.companyId ? String(data.companyId) : '');

    setEventId(
      data.eventGoods?.[0]?.event?.id
        ? String(data.eventGoods[0].event.id)
        : ''
    );

    const linkedLineup = data.kujiLineups?.[0] as GoodsKujiLineupResponse | undefined;

    if(linkedLineup) {
      setKujiId(String(linkedLineup.kuji.id));
      setKujiLineupId(String(linkedLineup.id));
      setEventId('');
    }

    setName(data.name || '');
    setGoodsType(data.goodsType || '');
    setSaleType(data.saleType || 'SINGLE');
    setOfficialPrice(
      data.officialPrice === null || data.officialPrice === undefined
        ? ''
        : String(data.officialPrice),
    );
    setIsNotForSale(Boolean(data.isNotForSale));
    setReleaseDate(
      data.releaseDate
        ? new Date(data.releaseDate).toISOString().slice(0, 10)
        : '',
    );
    setOfficialUrl(data.officialUrl || '');
    setThumbnailImageUrl(data.thumbnailImageUrl || '');
    setDescription(data.description || '');

    if(data.goodsItems && data.goodsItems.length > 0) {
      setItems(
        data.goodsItems.map((item: GoodsItemResponse) => ({
          name: item.name || '',
          characterName: item.characterName || '',
          imageUrl: item.imageUrl || '',
          rarity: item.rarity || '',
          dropRate:
            item.dropRate === null || item.dropRate === undefined
              ? ''
              : String(item.dropRate),
        }))
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setPageLoading(true);
        setMessage('');

        const resolvedParams = await params;
        const id = resolvedParams.id;

        setGoodsId(id);

        await Promise.all([
          getIpList(),
          getIpEventList(),
          getKujiList(),
          getManufacturerList(),
          getGoodsDetail(id),
        ]);
      } catch(error) {
        if(error instanceof Error) {
          setMessage(error.message);
          return;
        }

        setMessage('수정 화면 초기화 중 오류가 발생했습니다.');
      } finally {
        setPageLoading(false);
      }
    };

    init();
  }, [params]);

  useEffect(() => {
    const getKujiLineupList = async () => {
      if(!kujiId) {
        setKujiLineupList([]);
        setKujiLineupId('');
        return;
      }

      try {
        const response = await fetch(`/api/kujis/${kujiId}`, {
          method: 'GET',
        });
        const data = await response.json();

        if(!response.ok) {
          setMessage(data.message || '쿠지 라인업을 불러오지 못했습니다.');
          return;
        }

        setKujiLineupList((data as KujiDetailResponse).lineups);
      } catch {
        setMessage('쿠지 라인업 조회 중 오류가 발생했습니다.');
      }
    };

    getKujiLineupList();
  }, [kujiId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if(!goodsId || !ipId || !name) {
      setMessage('IP와 굿즈 이름을 입력해주세요.');
      return;
    }

    if(kujiId && !kujiLineupId) {
      setMessage('쿠지를 선택한 경우 쿠지 라인업도 선택해주세요.');
      return;
    }

    const filteredItems = items.filter((item) => item.name.trim());

    if(filteredItems.length === 0) {
      setMessage('굿즈 아이템을 최소 1개 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(`/api/goods/${goodsId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipId: Number(ipId),
          eventId: eventId === '' ? null : Number(eventId),
          kujiLineupId: kujiLineupId === '' ? null : Number(kujiLineupId),
          companyId: companyId === '' ? null : Number(companyId),
          name,
          goodsType,
          saleType,
          officialPrice: isNotForSale ? null : officialPrice === '' ? null : Number(officialPrice),
          isNotForSale,
          releaseDate: releaseDate === '' ? null : releaseDate,
          officialUrl,
          thumbnailImageUrl,
          description,
          items: filteredItems.map((item, index) => ({
            name: item.name,
            characterName: item.characterName || null,
            imageUrl: item.imageUrl || null,
            rarity: item.rarity || null,
            dropRate: item.dropRate ? Number(item.dropRate) : null,
            sortOrder: index,
          })),
        }),
      });

      const data = await response.json();

      if(!response.ok) {
        setMessage(data.message || '굿즈 수정에 실패했습니다.');
        return;
      }

      router.push(`/goods/${goodsId}`);
      router.refresh();
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if(pageLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.message}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>굿즈 수정</h1>
            <p style={styles.subText}>ID: {goodsId}</p>
          </div>

          <div style={styles.headerButtonGroup}>
            <Link href={goodsId ? `/goods/${goodsId}` : '/goods'} style={styles.linkButton}>
              상세
            </Link>

            <Link href="/goods" style={styles.linkButton}>
              목록
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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
              style={{
                ...styles.input,
                ...(kujiId ? styles.disabledInput : {}),
              }}
              value={eventId}
              onChange={handleChangeIpEvent}
              disabled={Boolean(kujiId)}
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
            <label style={styles.label}>쿠지</label>
            <select
              style={{
                ...styles.input,
                ...(eventId ? styles.disabledInput : {}),
              }}
              value={kujiId}
              onChange={handleChangeKuji}
              disabled={Boolean(eventId)}
            >
              <option value="">선택 안 함</option>
              {filteredKujiList.map((kuji) => (
                <option key={kuji.id} value={kuji.id}>
                  {kuji.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>쿠지 라인업</label>
            <select
              style={{
                ...styles.input,
                ...(!kujiId || eventId ? styles.disabledInput : {}),
              }}
              value={kujiLineupId}
              onChange={(event) => setKujiLineupId(event.target.value)}
              disabled={!kujiId || Boolean(eventId)}
            >
              <option value="">선택 안 함</option>
              {kujiLineupList.map((lineup) => (
                <option
                  key={lineup.id}
                  value={lineup.id}
                  disabled={Boolean(lineup.goodsId) && String(lineup.id) !== kujiLineupId}
                >
                  {formatKujiLineupLabel(lineup)}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>제조사</label>
            <select
              style={styles.input}
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
            >
              <option value="">선택 안 함</option>
              {manufacturerList.map((manufacturer) => (
                <option key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
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

          <div style={styles.field}>
            <label style={styles.label}>판매 방식</label>
            <select
              style={styles.input}
              value={saleType}
              onChange={(event) => setSaleType(event.target.value)}
            >
              <option value="SINGLE">단일</option>
              <option value="SELECTABLE">선택 구매</option>
              <option value="RANDOM">랜덤</option>
            </select>
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

          <div style={styles.itemSection}>
            <div style={styles.itemHeader}>
              <h2 style={styles.subTitle}>굿즈 아이템</h2>

              <button type="button" style={styles.smallButton} onClick={handleAddItem}>
                아이템 추가
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} style={styles.itemBox}>
                <div style={styles.field}>
                  <label style={styles.label}>아이템 이름</label>
                  <input
                    style={styles.input}
                    value={item.name}
                    onChange={(event) =>
                      handleChangeItem(index, 'name', event.target.value)
                    }
                    placeholder="예: 루피 A타입"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>캐릭터명</label>
                  <input
                    style={styles.input}
                    value={item.characterName}
                    onChange={(event) =>
                      handleChangeItem(index, 'characterName', event.target.value)
                    }
                    placeholder="예: 루피"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>이미지 URL</label>
                  <input
                    style={styles.input}
                    value={item.imageUrl}
                    onChange={(event) =>
                      handleChangeItem(index, 'imageUrl', event.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>레어도</label>
                  <input
                    style={styles.input}
                    value={item.rarity}
                    onChange={(event) =>
                      handleChangeItem(index, 'rarity', event.target.value)
                    }
                    placeholder="예: A, B, SSR"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>확률</label>
                  <input
                    style={styles.input}
                    value={item.dropRate}
                    onChange={(event) =>
                      handleChangeItem(index, 'dropRate', event.target.value)
                    }
                    placeholder="예: 10"
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => handleRemoveItem(index)}
                  >
                    아이템 삭제
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            {loading ? '수정 중...' : '수정'}
          </button>
        </form>

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
    padding: '24px 0',
  },
  card: {
    width: 520,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  subText: {
    margin: '8px 0 0',
    fontSize: 14,
    color: '#6b7280',
  },
  headerButtonGroup: {
    display: 'flex',
    gap: 8,
  },
  linkButton: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    color: '#111827',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
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
  itemSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
  },
  smallButton: {
    height: 34,
    padding: '0 12px',
    borderRadius: 6,
    border: '1px solid #dcdfe3',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  itemBox: {
    padding: 16,
    marginBottom: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  removeButton: {
    width: '100%',
    height: 36,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
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
