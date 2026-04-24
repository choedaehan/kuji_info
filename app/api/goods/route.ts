import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const goodsList = await prisma.goods.findMany({
      include: {
        ip: true,
        ipEvent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(goodsList);
  } catch(error) {
    console.error(error);

    return NextResponse.json(
      { message: '굿즈 목록 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

import { NextRequest } from 'next/server';

// 굿즈 등록 (Goods + GoodsItem)
export async function POST(request: NextRequest) {
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

    const goods = await prisma.$transaction(async (tx) => {
      // 1. Goods 생성
      const createdGoods = await tx.goods.create({
        data: {
          ipId: Number(ipId),
          ipEventId: ipEventId ? Number(ipEventId) : null,
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

      // 2. GoodsItem 생성
      await tx.goodsItem.createMany({
        data: items.map((item: any, index: number) => ({
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
      { message: '굿즈 등록 실패' },
      { status: 500 }
    );
  }
}