"use client";

import { useEffect, useMemo, useState } from "react";

type IP = { id: number; name: string };
type KujiSeries = { id: number; name: string; totalCellCount: number };

type Cell = {
  row: number;
  col: number;
  grade: string; // '' = 닫힘
};

export default function KujiSetCreatePage() {
  /* =====================
   * 기본 상태
   ===================== */
  const [ipList, setIpList] = useState<IP[]>([]);
  const [seriesList, setSeriesList] = useState<KujiSeries[]>([]);

  const [ipId, setIpId] = useState("");
  const [seriesId, setSeriesId] = useState("");

  const [totalCellCount, setTotalCellCount] = useState<number>(0);
  const [columnCount, setColumnCount] = useState<number>(7);

  const [cells, setCells] = useState<Cell[]>([]);

  /* =====================
   * 초기 데이터 로드
   ===================== */
  useEffect(() => {
    fetch("/api/ip").then(res => res.json()).then(setIpList);
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

  /* =====================
   * 시리즈 선택 시 total 자동 매칭
   ===================== */
  useEffect(() => {
    if (!seriesId) return;

    const series = seriesList.find(s => s.id === Number(seriesId));
    if (series) {
      setTotalCellCount(series.totalCellCount);
    }
  }, [seriesId, seriesList]);

  /* =====================
   * row 계산
   ===================== */
  const rowCount = useMemo(() => {
    if (!totalCellCount || !columnCount) return 0;
    return Math.ceil(totalCellCount / columnCount);
  }, [totalCellCount, columnCount]);

  /* =====================
   * 셀 생성
   ===================== */
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

  /* =====================
   * 셀 등급 변경
   ===================== */
  const updateCellGrade = (row: number, col: number, grade: string) => {
    setCells(prev =>
      prev.map(cell =>
        cell.row === row && cell.col === col
          ? { ...cell, grade }
          : cell
      )
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontSize: 14 }}>
      <h2>🎰 쿠지 세트 입력</h2>

      {/* 기본 정보 */}
      <Section title="기본 정보">
        <Row>
          <Label>IP</Label>
          <select value={ipId} onChange={e => setIpId(e.target.value)}>
            <option value="">선택 안 함</option>
            {ipList.map(ip => (
              <option key={ip.id} value={ip.id}>{ip.name}</option>
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
          <Label>총 셀 개수</Label>
          <input
            type="number"
            value={totalCellCount || ""}
            onChange={e => setTotalCellCount(Number(e.target.value))}
          />
        </Row>

        <Row>
          <Label>Column 수</Label>
          <input
            type="number"
            value={columnCount}
            onChange={e => setColumnCount(Number(e.target.value))}
          />
        </Row>

        <Row>
          <Label>Row 수</Label>
          <div>{rowCount}</div>
        </Row>

        <button onClick={generateCells}>그리드 생성</button>
      </Section>

      {/* 셀 입력 */}
      {cells.length > 0 && (
        <Section title="셀 상태 입력">
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
                  padding: 6,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 11 }}>
                  {cell.row},{cell.col}
                </div>
                <input
                  placeholder="닫힘"
                  value={cell.grade}
                  onChange={e =>
                    updateCellGrade(cell.row, cell.col, e.target.value.toUpperCase())
                  }
                  style={{ width: "100%", textAlign: "center" }}
                />
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* =====================
 * UI Helper
 ===================== */

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
  return <div style={{ width: 120, fontWeight: 600 }}>{children}</div>;
}
