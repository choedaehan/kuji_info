import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const {
    ipId,
    name,
    totalCellCount,
    releaseDate,
    officialUrl,
    thumbnailImageUrl,
  } = body;

  const result = await prisma.kujiSeries.create({
    data: {
      ipId: Number(ipId),
      name,
      totalCellCount: Number(totalCellCount),
      releaseDate: new Date(releaseDate),
      officialUrl,
      thumbnailImageUrl,
    },
  });

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ipId = searchParams.get("ipId");

  const list = await prisma.kujiSeries.findMany({
    where: ipId ? { ipId: Number(ipId) } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      totalCellCount: true,
    },
  });

  return NextResponse.json(list);
}