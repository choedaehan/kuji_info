import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * 쿠지 프라이즈 생성
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    kujiSeriesId,
    grade,
    name,
    productType,
    thumbnailImageUrl,
    totalCount,
    price,
  } = body;

  const result = await prisma.kujiPrize.create({
    data: {
      kujiSeriesId: Number(kujiSeriesId),
      grade,
      name,
      productType,
      thumbnailImageUrl,
      totalCount: Number(totalCount),
      price: Number(price),
    },
  });

  return NextResponse.json(result);
}

/**
 * 쿠지 시리즈 기준 프라이즈 조회
 * ?kujiSeriesId=1
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kujiSeriesId = searchParams.get("kujiSeriesId");

  if (!kujiSeriesId) {
    return NextResponse.json([], { status: 200 });
  }

  const list = await prisma.kujiPrize.findMany({
    where: { kujiSeriesId: Number(kujiSeriesId) },
    orderBy: { grade: "asc" },
  });

  return NextResponse.json(list);
}
