"use client";

import { useEffect, useMemo, useState } from "react";

type IP = { id: number; name: string };
type KujiSeries = { id: number; name: string; totalCellCount: number };

type Cell = {
  row: number;
  col: number;
  grade: string; // '' = 닫힘
};

export default function KujiObservationCreatePage() {
  const [ipList, setIpList] = useState<IP[]>([]);
  const [seriesList, setSeriesList] = useState<KujiSeries[]>([]);

  const [ipId, setIpId] = useState("");
  const [seriesId, setSeriesId] = useState("");

  const [totalCellCount, setTotalCellCount] = useState(0);
  const [columnCount, setColumnCount] = useState(7);

  const [cells, setCells] = useState<Cell[]>([]);

  /* 🔥 hydration-safe setId */
  const [setId, setSetId] = useState<string>("");

  useEffect(() => {
    setSetId(crypto.randomUUID());
  }, []);

  /* ---------- load ---------- */
  useEffect(() => {
    fetch("/api/ip")
      .then(res => res.json())
      .then(setIpList);
  }, []);

  useEffect(() => {
    if (!ipId) {
      setSeriesList([]);
      setSeriesId("");
      return;
    }

    fetch(`/api/kuji-series?ipId=${ipId}`)
      .then(res => res.json())
      .then(setSeriesList);
  }, [ipId]);

  useEffect(() => {
    if (!seriesId) return;
    const s = seriesList.find(v => v.id === Number(seriesId));
    if (s) setTotalCellCount(s.totalCellCount);
  }, [seriesId, seriesList]);

  /* ---------- grid ---------- */
  const rowCount = useMemo(() => {
    if (!totalCellCount || !columnCount) return 0;
    return Math.ceil(totalCellCount / columnCount);
  }, [totalCellCount, columnCount]);

  const generateCells = () => {
    const result: Cell[] = [];
    let index = 0;

    for (let r = 1; r <= rowCount; r++) {
      for (let c = 1; c <= columnCount; c++) {
        if (index >= totalCellCount) break;
        result.push({ row: r, col: c, grade: "" });
        index++;
      }
    }

    setCells(result);
  };

  const updateCellGrade = (row: number, col: number, grade: string) => {
    setCells(prev =>
      prev.map(cell =>
        cell.row === row && cell.col === col
          ? { ...cell, grade }
          : cell
      )
    );
  };

  /* ---------- save ---------- */
  const saveObservation = async () => {
    const observations = cells
      .filter(c => c.grade)
      .map(c => ({
        row: c.row,
        col: c.col,
        grade: c.grade.toUpperCase(),
      }));

    await fetch("/api/kuji-observation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        kujiSeriesId: seriesId ? Number(seriesId) : undefined,
        totalCellCount,
        observations,
      }),
    });

    alert("Observation 저장 완료");
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontSize: 14 }}>
      <h2>📊 쿠지 Observation 입력</h2>

      {setId && (
        <div style={{ marginBottom: 12, color: "#666" }}>
          setId: {setId}
        </div>
      )}

      {/* 기본 정보 */}
      <Section title="기본 정보">
        <Row>
          <Label>IP</Label>
          <select value={ipId} onChange={e => setIpId(e.target.value)}>
            <option value="">선택 안 함</option>
            {ipList.map(ip => (
              <option key={ip.id} value={ip.id}>
                {ip.name}
              </option>
            ))}
          </select>
        </Row>

        <Row>
          <Label>쿠지 시리즈</Label>
          <select value={seriesId} onChange={e => setSeriesId(e.target.value)}>
            <option value="">선택 안 함</option>
            {seriesList.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Row>

        <Row>
          <Label>총 셀 수</Label>
          <input
            type="number"
            value={totalCellCount || ""}
            onChange={e => setTotalCellCount(Number(e.target.value))}
          />
        </Row>

        <Row>
          <Label>Column</Label>
          <input
            type="number"
            value={columnCount}
            onChange={e => setColumnCount(Number(e.target.value))}
          />
        </Row>

        <Row>
          <Label>Row</Label>
          <div>{rowCount}</div>
        </Row>

        <button onClick={generateCells}>그리드 생성</button>
      </Section>

      {/* grid */}
      {cells.length > 0 && (
        <Section title="셀 관측 입력 (기본 닫힘)">
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
                style={{ border: "1px solid #ccc", padding: 6 }}
              >
                <div style={{ fontSize: 11 }}>
                  {cell.row},{cell.col}
                </div>
                <input
                  placeholder="닫힘"
                  value={cell.grade}
                  onChange={e =>
                    updateCellGrade(cell.row, cell.col, e.target.value)
                  }
                  style={{ width: "100%", textAlign: "center" }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <button onClick={saveObservation}>Observation 저장</button>
          </div>
        </Section>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Row({ children }: any) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function Label({ children }: any) {
  return (
    <div style={{ width: 120, fontWeight: 600 }}>
      {children}
    </div>
  );
}
