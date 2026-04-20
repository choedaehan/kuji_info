import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ipEventList = await prisma.ipEvent.findMany({
      include: {
        ip: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(ipEventList);
  } catch(error) {
    console.error(error);

    return NextResponse.json(
      { message: 'IP 이벤트 목록 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      ipId,
      name,
      startDate,
      endDate,
      location,
      officialUrl,
      description,
    } = body;

    if(!ipId || !name) {
      return NextResponse.json(
        { message: 'IP와 이벤트 이름은 필수입니다.' },
        { status: 400 },
      );
    }

    const createdIpEvent = await prisma.ipEvent.create({
      data: {
        ipId: Number(ipId),
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        officialUrl: officialUrl || null,
        description: description || null,
      },
    });

    return NextResponse.json(createdIpEvent, { status: 201 });
  } catch(error) {
    console.error(error);

    return NextResponse.json(
      { message: 'IP 이벤트 등록에 실패했습니다.' },
      { status: 500 },
    );
  }
}