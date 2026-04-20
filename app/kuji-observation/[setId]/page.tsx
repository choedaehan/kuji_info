"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Observation = {
  setId: string;
  kujiSeriesId: number | null;
  totalCellCount: number;
  row: number;
  col: number;
  grade: string;
};

type Cell = {
  row: number;
  col: number;
  grade: string;
};

export default function KujiObservationDetailPage() {
  const params = useParams();
  const setId = params.setId as string;

  const [data, setData] = useState<Observation[]>([]);
  const [columnCount, setColumnCount] = useState(7);

  useEffect(() => {
    fetch(`/api/kuji-observation/detail?setId=${setId}`)
      .then(res => res.json())
      .then(setData);
  }, [setId]);

  /* ---------- 기본 정보 ---------- */
  const totalCellCount = data[0]?.totalCellCount ?? 0;

  const rowCount = useMemo(() => {
    if (!totalCellCount) return 0;
    return Math.ceil(totalCellCount / columnCount);
  }, [totalCellCount, columnCount]);

  /* ---------- 셀 복원 ---------- */
  const cells: Cell[] = useMemo(() => {
    const map = new Map<string, string>();

    data.forEach(o => {
      map.set(`${o.row}-${o.col}`, o.grade);
    });

    const result: Cell[] = [];
    let index = 0;

    for (let r = 1; r <= rowCount; r++) {
      for (let c = 1; c <= columnCount; c++) {
        if (index >= totalCellCount) break;
        result.push({
          row: r,
          col: c,
          grade: map.get(`${r}-${c}`) ?? "",
        });
        index++;
      }
    }

    return result;
  }, [data, rowCount, columnCount, totalCellCount]);

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>📊 Observation 상세</h2>

      <div style={{ marginBottom: 16, fontSize: 13, color: "#666" }}>
        <div>setId: {setId}</div>
        <div>총 셀 수: {totalCellCount}</div>
        <div>column: {columnCount}</div>
      </div>

      {/* grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: 6,
        }}
      >
        {cells.map(cell => (
          <div
            key={`${cell.row}-${cell.col}`}
            style={{
              border: "1px solid #ccc",
              padding: 8,
              textAlign: "center",
              background: cell.grade ? "#111" : "#f9f9f9",
              color: cell.grade ? "#fff" : "#999",
            }}
          >
            <div style={{ fontSize: 11 }}>
              {cell.row},{cell.col}
            </div>
            <div style={{ fontWeight: 600 }}>
              {cell.grade || "닫힘"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
