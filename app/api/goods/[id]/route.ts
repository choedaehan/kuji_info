import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const goodsId = Number(id);

    if(Number.isNaN(goodsId)) {
      return NextResponse.json(
        { message: '유효하지 않은 굿즈 ID입니다.' },
        { status: 400 },
      );
    }

    const goods = await prisma.goods.findUnique({
      where: {
        id: goodsId,
      },
      include: {
        ip: true,
        ipEvent: true,
      },
    });

    if(!goods) {
      return NextResponse.json(
        { message: '굿즈를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return NextResponse.json(goods);
  } catch(error) {
    console.error(error);

    return NextResponse.json(
      { message: '굿즈 상세 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const goodsId = Number(id);

    if(Number.isNaN(goodsId)) {
      return NextResponse.json(
        { message: '유효하지 않은 굿즈 ID입니다.' },
        { status: 400 },
      );
    }

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

    const existingGoods = await prisma.goods.findUnique({
      where: {
        id: goodsId,
      },
    });

    if(!existingGoods) {
      return NextResponse.json(
        { message: '굿즈를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    const updatedGoods = await prisma.goods.update({
      where: {
        id: goodsId,
      },
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

    return NextResponse.json(updatedGoods);
  } catch(error) {
    console.error(error);

    return NextResponse.json(
      { message: '굿즈 수정에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> },
  ) {
  try {
    const resolvedParams = await context.params;
    const id = Number(resolvedParams.id);

    if(!id) {
      return Response.json(
        { message: '유효하지 않은 굿즈 ID입니다.' },
        { status: 400 },
      );
    }

    await prisma.goods.delete({
      where: {
        id,
      },
    });

    return Response.json({
      message: '굿즈가 삭제되었습니다.',
    });
  } catch(error) {
    console.error(error);

    return Response.json(
      { message: '굿즈 삭제에 실패했습니다.' },
      { status: 500 },
    );
  }
}