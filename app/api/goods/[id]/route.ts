import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// 굿즈 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goodsId = Number(id);

  if (isNaN(goodsId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  const goods = await prisma.goods.findUnique({
    where: { id: goodsId },
    include: {
      goodsItems: {
        orderBy: { sortOrder: 'asc' },
      },
      ip: true,
      eventGoods: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!goods) {
    return NextResponse.json({ message: '굿즈를 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json(goods);
}

// 굿즈 수정 (Goods + GoodsItem)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goodsId = Number(id);

  if (isNaN(goodsId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    const body = await request.json();

    const {
      ipId,
      ipEventId,
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

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: '굿즈 아이템이 최소 1개 필요합니다.' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Goods 업데이트
      await tx.goods.update({
        where: { id: goodsId },
        data: {
          ipId: Number(ipId),
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

      // 2. 기존 이벤트 연결 삭제
      await tx.eventGoods.deleteMany({
        where: { goodsId },
      });

      // 3. 새 이벤트 연결 생성
      if (ipEventId) {
        await tx.eventGoods.create({
          data: {
            goodsId,
            eventId: Number(ipEventId),
          },
        });
      }

      // 4. 기존 GoodsItem 삭제
      await tx.goodsItem.deleteMany({
        where: { goodsId },
      });

      // 5. 새 GoodsItem 생성
      await tx.goodsItem.createMany({
        data: items.map((item: any, index: number) => ({
          goodsId,
          name: item.name,
          characterName: item.characterName || null,
          imageUrl: item.imageUrl || null,
          rarity: item.rarity || null,
          dropRate: item.dropRate ?? null,
          sortOrder: item.sortOrder ?? index,
        })),
      });
    });

    return NextResponse.json({ message: '수정 완료' });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '굿즈 수정 실패' },
      { status: 500 }
    );
  }
}

// 굿즈 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goodsId = Number(id);

  if (isNaN(goodsId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.eventGoods.deleteMany({
        where: { goodsId },
      });

      await tx.goodsItem.deleteMany({
        where: { goodsId },
      });

      await tx.goods.delete({
        where: { id: goodsId },
      });
    });

    return NextResponse.json({ message: '삭제 완료' });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '삭제 실패' },
      { status: 500 }
    );
  }
}