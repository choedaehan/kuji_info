import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type KujiLineupPayload = {
  goodsId?: number | string | null;
  prizeName?: string | null;
  prizeType?: string | null;
  grade?: string | null;
  quantity?: number | string | null;
  sortOrder?: number | string | null;
};

export async function GET() {
  try {
    const kujiList = await prisma.kuji.findMany({
      include: {
        ip: true,
        _count: {
          select: {
            lineups: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(kujiList);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '쿠지 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ipId,
      name,
      japanPricePerTry,
      koreaPricePerTry,
      totalCount,
      japanReleaseDate,
      koreaReleaseDate,
      officialUrl,
      description,
      lineups,
    } = body;

    if (!ipId || !name) {
      return NextResponse.json(
        { message: 'IP와 쿠지 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    const lineupData = normalizeLineups(lineups);

    const kuji = await prisma.$transaction(async (tx) => {
      const createdKuji = await tx.kuji.create({
        data: {
          ipId: Number(ipId),
          name,
          japanPricePerTry: japanPricePerTry ? Number(japanPricePerTry) : null,
          koreaPricePerTry: koreaPricePerTry ? Number(koreaPricePerTry) : null,
          totalCount: totalCount ? Number(totalCount) : null,
          japanReleaseDate: japanReleaseDate ? new Date(japanReleaseDate) : null,
          koreaReleaseDate: koreaReleaseDate ? new Date(koreaReleaseDate) : null,
          officialUrl: officialUrl || null,
          description: description || null,
        },
      });

      if (lineupData.length > 0) {
        await tx.kujiLineup.createMany({
          data: lineupData.map((lineup, index) => ({
            kujiId: createdKuji.id,
            goodsId: lineup.goodsId,
            prizeName: lineup.prizeName,
            prizeType: lineup.prizeType,
            grade: lineup.grade,
            quantity: lineup.quantity,
            sortOrder: lineup.sortOrder ?? index,
          })),
        });
      }

      return createdKuji;
    });

    return NextResponse.json(kuji);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '쿠지 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}

function normalizeLineups(lineups: unknown) {
  if (!Array.isArray(lineups)) {
    return [];
  }

  return (lineups as KujiLineupPayload[])
    .map((lineup, index) => ({
      goodsId:
        lineup.goodsId === undefined || lineup.goodsId === null || lineup.goodsId === ''
          ? null
          : Number(lineup.goodsId),
      prizeName: lineup.prizeName?.trim() ?? '',
      prizeType: lineup.prizeType?.trim() || null,
      grade: lineup.grade?.trim() || null,
      quantity:
        lineup.quantity === undefined || lineup.quantity === null || lineup.quantity === ''
          ? null
          : Number(lineup.quantity),
      sortOrder:
        lineup.sortOrder === undefined || lineup.sortOrder === null || lineup.sortOrder === ''
          ? index
          : Number(lineup.sortOrder),
    }))
    .filter((lineup) => lineup.prizeName);
}
