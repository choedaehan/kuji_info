import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const companyId = Number(id);

  if (Number.isNaN(companyId)) {
    return NextResponse.json(
      { message: '잘못된 제조사 ID입니다.' },
      { status: 400 }
    );
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { message: '제조사를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '제조사 조회 실패' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const companyId = Number(id);

  if (Number.isNaN(companyId)) {
    return NextResponse.json(
      { message: '잘못된 제조사 ID입니다.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, officialUrl } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { message: '제조사명은 필수입니다.' },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { id: companyId },
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
      { message: '제조사 수정 실패' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const companyId = Number(id);

  if (Number.isNaN(companyId)) {
    return NextResponse.json(
      { message: '잘못된 제조사 ID입니다.' },
      { status: 400 }
    );
  }

  try {
    await prisma.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ message: '삭제 완료' });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '제조사 삭제 실패' },
      { status: 500 }
    );
  }
}
