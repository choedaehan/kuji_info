import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, SaleType } from '@/app/generated/prisma/client';

type GoodsItemPayload = {
  name: string;
  characterName?: string | null;
  imageUrl?: string | null;
  rarity?: string | null;
  dropRate?: number | null;
  sortOrder?: number;
};

type KujiLineupLinkPayload = {
  ipId: number | string;
  kujiLineupId?: number | string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ipId = searchParams.get('ipId');
    const companyId = searchParams.get('companyId');
    const eventId = searchParams.get('eventId');
    const kujiId = searchParams.get('kujiId');
    const saleType = searchParams.get('saleType');
    const isNotForSale = searchParams.get('isNotForSale');
    const goodsType = searchParams.get('goodsType');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSizeParam = Number(searchParams.get('pageSize')) || 10;
    const pageSize = Math.min(50, Math.max(1, pageSizeParam));
    const skip = (page - 1) * pageSize;

    const where: Prisma.GoodsWhereInput = {};

    if (ipId) {
      where.ipId = Number(ipId);
    }

    if (companyId) {
      where.companyId = Number(companyId);
    }

    if (eventId) {
      where.eventGoods = {
        some: {
          eventId: Number(eventId),
        },
      };
    }

    if (eventId && kujiId) {
      return NextResponse.json(
        { message: '이벤트와 쿠지는 동시에 검색할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (kujiId) {
      where.kujiLineups = {
        some: {
          kujiId: Number(kujiId),
        },
      };
    }

    if (
      saleType === SaleType.SINGLE ||
      saleType === SaleType.SELECTABLE ||
      saleType === SaleType.RANDOM
    ) {
      where.saleType = saleType;
    }

    if (isNotForSale === 'true' || isNotForSale === 'false') {
      where.isNotForSale = isNotForSale === 'true';
    }

    if (goodsType) {
      where.goodsType = {
        contains: goodsType,
      };
    }

    const [goodsList, totalCount] = await prisma.$transaction([
      prisma.goods.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          ip: true,
          company: true,
          eventGoods: {
            include: {
              event: true,
            },
          },
          kujiLineups: {
            include: {
              kuji: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.goods.count({ where }),
    ]);

    return NextResponse.json({
      items: goodsList,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      },
    });
  } catch(error) {
    console.error(error);

    return NextResponse.json(
      { message: '굿즈 목록 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

// 굿즈 등록 (Goods + GoodsItem)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      ipId,
      eventId,
      kujiLineupId,
      companyId,
      name,
      goodsType,
      saleType,
      officialPrice,
      isNotForSale,
      releaseDate,
      officialUrl,
      thumbnailImageUrl,
      description,
      items,
    } = body;

    if (!ipId || !name) {
      return NextResponse.json(
        { message: 'IP와 굿즈 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    if (eventId && kujiLineupId) {
      return NextResponse.json(
        { message: '이벤트와 쿠지는 동시에 연결할 수 없습니다.' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: '굿즈 아이템이 최소 1개 필요합니다.' },
        { status: 400 }
      );
    }

    const goods = await prisma.$transaction(async (tx) => {
      const createdGoods = await tx.goods.create({
        data: {
          ipId: Number(ipId),
          companyId: companyId ? Number(companyId) : null,
          name,
          goodsType: goodsType || null,
          saleType: saleType || 'SINGLE',
          officialPrice: officialPrice ?? null,
          isNotForSale: Boolean(isNotForSale),
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          officialUrl: officialUrl || null,
          thumbnailImageUrl: thumbnailImageUrl || null,
          description: description || null,
        },
      });

      if (eventId) {
        await tx.eventGoods.create({
          data: {
            eventId: Number(eventId),
            goodsId: createdGoods.id,
          },
        });
      }

      if (kujiLineupId) {
        await validateKujiLineup(tx, {
          ipId,
          kujiLineupId,
        });

        await tx.kujiLineup.update({
          where: {
            id: Number(kujiLineupId),
          },
          data: {
            goodsId: createdGoods.id,
          },
        });
      }

      await tx.goodsItem.createMany({
        data: (items as GoodsItemPayload[]).map((item, index) => ({
          goodsId: createdGoods.id,
          name: item.name,
          characterName: item.characterName || null,
          imageUrl: item.imageUrl || null,
          rarity: item.rarity || null,
          dropRate: item.dropRate ?? null,
          sortOrder: item.sortOrder ?? index,
        })),
      });

      return createdGoods;
    });

    return NextResponse.json(goods);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: error instanceof Error ? error.message : '굿즈 등록 실패' },
      { status: 500 }
    );
  }
}

async function validateKujiLineup(
  tx: Prisma.TransactionClient,
  { ipId, kujiLineupId }: KujiLineupLinkPayload
) {
  const lineup = await tx.kujiLineup.findUnique({
    where: {
      id: Number(kujiLineupId),
    },
    include: {
      kuji: true,
    },
  });

  if (!lineup) {
    throw new Error('선택한 쿠지 라인업을 찾을 수 없습니다.');
  }

  if (lineup.kuji.ipId !== Number(ipId)) {
    throw new Error('굿즈 IP와 쿠지 라인업의 IP가 다릅니다.');
  }

  if (lineup.goodsId) {
    throw new Error('이미 다른 굿즈에 연결된 쿠지 라인업입니다.');
  }

  return lineup;
}
