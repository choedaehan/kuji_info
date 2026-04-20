import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const setId = searchParams.get("setId");

  if (!setId) {
    return new NextResponse("setId is required", { status: 400 });
  }

  const list = await prisma.kujiObservation.findMany({
    where: { setId },
    orderBy: [
      { row: "asc" },
      { col: "asc" },
    ],
    select: {
      setId: true,
      kujiSeriesId: true,
      totalCellCount: true,
      row: true,
      col: true,
      grade: true,
    },
  });

  return NextResponse.json(list);
}
