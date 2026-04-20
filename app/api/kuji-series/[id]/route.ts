import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⭐ 핵심

  const seriesId = Number(id);
  if (Number.isNaN(seriesId)) {
    return NextResponse.json(
      { message: "Invalid kujiSeries id" },
      { status: 400 }
    );
  }

  const series = await prisma.kujiSeries.findUnique({
    where: { id: seriesId },
    select: {
      id: true,
      name: true,
      totalCellCount: true,
      price: true,
      prizes: {
        select: {
          grade: true,
          price: true,
        },
      },
    },
  });

  return NextResponse.json(series);
}
