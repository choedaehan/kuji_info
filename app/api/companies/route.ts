import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, officialUrl } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: '제조사명은 필수입니다.' },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        officialUrl:
          typeof officialUrl === 'string' && officialUrl.trim()
            ? officialUrl.trim()
            : null,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '제조사 등록 실패' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const companyList = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(companyList);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '제조사 목록 조회 실패' },
      { status: 500 }
    );
  }
}
