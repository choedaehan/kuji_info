// app/api/kuji-observation/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    setId,
    kujiSeriesId,
    totalCellCount, // ⭐️ 추가
    observations,
  } = body;

  if (!setId || !totalCellCount) {
    return new NextResponse("setId and totalCellCount are required", {
      status: 400,
    });
  }

  const data = observations
    .filter((o: any) => o.grade)
    .map((o: any) => ({
      kujiSeriesId: kujiSeriesId ?? null,
      setId,
      totalCellCount, // ⭐️ 필수 필드 충족
      row: o.row,
      col: o.col,
      grade: o.grade,
    }));

  const result = await prisma.kujiObservation.createMany({
    data,
  });

  return NextResponse.json({
    inserted: result.count,
  });
}
