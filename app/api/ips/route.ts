import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// IP 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      englishName,
      originalName,
      officialUrl,
      description,
      status,
    } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'IP 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    const ip = await prisma.ip.create({
      data: {
        name,
        englishName: englishName || null,
        originalName: originalName || null,
        officialUrl: officialUrl || null,
        description: description || null,
        status: status || 'ACTIVE',
      },
    });

    return NextResponse.json(ip);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: 'IP 등록 실패' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const ipList = await prisma.ip.findMany({
    orderBy: { createdAt: "desc" },
  });
  console.log(ipList);
  return NextResponse.json(ipList);
}
