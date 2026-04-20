import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { message: 'name과 slug는 필수입니다.' },
        { status: 400 }
      );
    }

    const ip = await prisma.ip.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(ip, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: '이미 존재하는 slug입니다.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'IP 생성 중 오류 발생' },
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
