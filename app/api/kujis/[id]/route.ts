import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type KujiLineupPayload = {
  id?: number | string | null;
  goodsId?: number | string | null;
  prizeName?: string | null;
  prizeType?: string | null;
  grade?: string | null;
  quantity?: number | string | null;
  sortOrder?: number | string | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kujiId = Number(id);

  if (Number.isNaN(kujiId)) {
    return NextResponse.json(
      { message: '잘못된 쿠지 ID입니다.' },
      { status: 400 }
    );
  }

  try {
    const kuji = await prisma.kuji.findUnique({
      where: { id: kujiId },
      include: {
        ip: true,
        lineups: {
          include: {
            goods: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!kuji) {
      return NextResponse.json(
        { message: '쿠지를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(kuji);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '쿠지 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kujiId = Number(id);

  if (Number.isNaN(kujiId)) {
    return NextResponse.json(
      { message: '잘못된 쿠지 ID입니다.' },
      { status: 400 }
    );
  }

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
      const updatedKuji = await tx.kuji.update({
        where: { id: kujiId },
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

      const existingLineups = await tx.kujiLineup.findMany({
        where: { kujiId },
        select: { id: true },
      });
      const existingIds = new Set(existingLineups.map((lineup) => lineup.id));
      const submittedIds = lineupData
        .map((lineup) => lineup.id)
        .filter((lineupId): lineupId is number => typeof lineupId === 'number');

      await tx.kujiLineup.deleteMany({
        where: {
          kujiId,
          id: {
            notIn: submittedIds,
          },
        },
      });

      await Promise.all(
        lineupData.map((lineup, index) => {
          const data = {
            goodsId: lineup.goodsId,
            prizeName: lineup.prizeName,
            prizeType: lineup.prizeType,
            grade: lineup.grade,
            quantity: lineup.quantity,
            sortOrder: lineup.sortOrder ?? index,
          };

          if (lineup.id && existingIds.has(lineup.id)) {
            return tx.kujiLineup.update({
              where: { id: lineup.id },
              data,
            });
          }

          return tx.kujiLineup.create({
            data: {
              kujiId,
              ...data,
            },
          });
        })
      );

      return updatedKuji;
    });

    return NextResponse.json(kuji);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '쿠지 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kujiId = Number(id);

  if (Number.isNaN(kujiId)) {
    return NextResponse.json(
      { message: '잘못된 쿠지 ID입니다.' },
      { status: 400 }
    );
  }

  try {
    await prisma.kuji.delete({
      where: { id: kujiId },
    });

    return NextResponse.json({ message: '삭제 완료' });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '쿠지 삭제에 실패했습니다.' },
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
      id:
        lineup.id === undefined || lineup.id === null || lineup.id === ''
          ? null
          : Number(lineup.id),
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
