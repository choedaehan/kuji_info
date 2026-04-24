import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: 이벤트 상세 조회

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    const event = await prisma.ipEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { message: '이벤트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '이벤트 조회 실패' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    const body = await request.json();

    const event = await prisma.ipEvent.update({
      where: {
        id: eventId,
      },
      data: {
        ipId: Number(body.ipId),
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location || null,
        officialUrl: body.officialUrl || null,
        description: body.description || null,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '이벤트 수정 실패' },
      { status: 500 }
    );
  }
}

// DELETE: 이벤트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return NextResponse.json({ message: '잘못된 ID입니다.' }, { status: 400 });
  }

  try {
    await prisma.ipEvent.delete({
      where: { id: eventId },
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