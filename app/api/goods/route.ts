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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      ipId,
      ipEventId,
      name,
      goodsType,
      officialPrice,
      isNotForSale,
      releaseDate,
      officialUrl,
      thumbnailImageUrl,
      description,
    } = body;

    if(!ipId || !name) {
      return NextResponse.json(
        { message: 'IP와 굿즈 이름은 필수입니다.' },
        { status: 400 },
      );
    }

    const createdGoods = await prisma.goods.create({
      data: {
        ipId: Number(ipId),
        ipEventId: ipEventId ? Number(ipEventId) : null,
        name,
        goodsType: goodsType || null,
        officialPrice: isNotForSale ? null : officialPrice ? Number(officialPrice) : null,
        isNotForSale: Boolean(isNotForSale),
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        officialUrl: officialUrl || null,
        thumbnailImageUrl: thumbnailImageUrl || null,
        description: description || null,
      },
      include: {
        ip: true,
        ipEvent: true,
      },
    });

    return NextResponse.json(createdGoods, { status: 201 });
  } catch(error) {
    console.error(error);

    return NextResponse.json(
      { message: '굿즈 등록에 실패했습니다.' },
      { status: 500 },
    );
  }
}