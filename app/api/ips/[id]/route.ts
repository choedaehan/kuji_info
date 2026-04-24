import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ipId = Number(id);

  if (isNaN(ipId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    const ip = await prisma.ip.findUnique({
      where: { id: ipId },
    });

    if (!ip) {
      return NextResponse.json(
        { message: 'IP를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(ip);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: 'IP 조회 실패' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ipId = Number(id);

  if (isNaN(ipId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    await prisma.ip.delete({
      where: { id: ipId },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ipId = Number(id);

  if (isNaN(ipId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    const body = await request.json();

    const ip = await prisma.ip.update({
      where: {
        id: ipId,
      },
      data: {
        name: body.name,
        englishName: body.englishName || null,
        originalName: body.originalName || null,
        officialUrl: body.officialUrl || null,
        description: body.description || null,
        status: body.status || 'ACTIVE',
      },
    });

    return NextResponse.json(ip);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: 'IP 수정 실패' },
      { status: 500 }
    );
  }
}