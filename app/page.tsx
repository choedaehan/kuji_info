"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ================== types ================== */

type Ip = {
  id: number;
  name: string;
};

type KujiSeries = {
  id: number;
  name: string;
  totalCellCount: number;
  price: number;
};

type PrizeRow = {
  grade: "A" | "B" | "C" | "D";
  count: number;
  price: number;
};

/* ================== utils ================== */

const formatNumber = (v: number) => v.toLocaleString("ko-KR");
const parseNumber = (v: string) => Number(v.replace(/,/g, ""));

/* ================== page ================== */

export default function LandingPage() {
  const prevIpIdRef = useRef<number | null>(null);

  const [ips, setIps] = useState<Ip[]>([]);
  const [seriesList, setSeriesList] = useState<KujiSeries[]>([]);

  const [selectedIpId, setSelectedIpId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);

  /* ---------- number state ---------- */
  const [remainCount, setRemainCount] = useState(50);
  const [pricePerTry, setPricePerTry] = useState(850);
  const [lastOnePrice, setLastOnePrice] = useState(0);

  /* ---------- price input state (string) ---------- */
  const [pricePerTryInput, setPricePerTryInput] = useState("850");
  const [lastOnePriceInput, setLastOnePriceInput] = useState("0");

  const [openIpSection, setOpenIpSection] = useState(false);

  const [prizes, setPrizes] = useState<PrizeRow[]>([
    { grade: "A", count: 1, price: 0 },
    { grade: "B", count: 1, price: 0 },
    { grade: "C", count: 1, price: 0 },
    { grade: "D", count: 1, price: 0 },
  ]);

  /* ================== API ================== */

  useEffect(() => {
    fetch("/api/ip").then((r) => r.json()).then(setIps);
  }, []);

  useEffect(() => {
    if (prevIpIdRef.current !== selectedIpId) {
      // 상품 초기화
      setPrizes([
        { grade: "A", count: 0, price: 0 },
        { grade: "B", count: 0, price: 0 },
        { grade: "C", count: 0, price: 0 },
        { grade: "D", count: 0, price: 0 },
      ]);

      // 가격 초기화
      setPricePerTry(0);
      setPricePerTryInput("0");
      setLastOnePrice(0);
      setLastOnePriceInput("0");

      // 시리즈 선택 해제
      setSelectedSeriesId(null);
    }

    // 이전 IP 기록
    prevIpIdRef.current = selectedIpId;

    // IP 선택 해제
    if (!selectedIpId) {
      setSeriesList([]);
      return;
    }

    // IP 선택됨 → 시리즈 로드
    fetch(`/api/kuji-series?ipId=${selectedIpId}`)
      .then((r) => r.json())
      .then(setSeriesList);
  }, [selectedIpId]);



  useEffect(() => {
    if (!selectedSeriesId) {
      setPrizes([
        { grade: "A", count: 0, price: 0 },
        { grade: "B", count: 0, price: 0 },
        { grade: "C", count: 0, price: 0 },
        { grade: "D", count: 0, price: 0 },
      ]);

      setPricePerTry(0);
      setPricePerTryInput("0");

      return;
    }

    fetch(`/api/kuji-series/${selectedSeriesId}`)
      .then((r) => r.json())
      .then((series) => {
        setPricePerTry(series.price);
        setPricePerTryInput(formatNumber(series.price));

        setPrizes(
          ["A", "B", "C", "D"].map((g) => {
            const found = series.prizes.find((p: any) => p.grade === g);
            return {
              grade: g as PrizeRow["grade"],
              count: found?.count ?? 0,
              price: found?.price ?? 0,
            };
          })
        );
      });
  }, [selectedSeriesId]);

  /* ================== 계산 ================== */

  const topCount = useMemo(
    () => prizes.reduce((s, p) => s + p.count, 0),
    [prizes]
  );

  const probabilityFor = (n: number) => {
    if (n > remainCount || topCount <= 0) return 0;

    let fail = 1;
    for (let i = 0; i < n; i++) {
      fail *= (remainCount - topCount - i) / (remainCount - i);
    }
    return 1 - fail;
  };

  const allDrawCost = remainCount * pricePerTry;
  const prizeValue = prizes.reduce((s, p) => s + p.count * p.price, 0);
  const allDrawValue = prizeValue + lastOnePrice;
  const allDrawDiff = allDrawValue - allDrawCost;

  /* ================== render ================== */

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h2 style={{ textAlign: "center" }}>🎰 쿠지 계산기</h2>

      {/* IP / 시리즈 */}
      <Card>
        <div
          onClick={() => setOpenIpSection((v) => !v)}
          style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }}
        >
          <strong>IP / 쿠지 정보 불러오기 (선택)</strong>
          <span
            style={{
              display: "inline-block",
              fontSize: 14,
              transform: "scaleY(0.85)",
            }}
          >
            {openIpSection ? "▲" : "▼"}
          </span>
        </div>

        {openIpSection && (
          <div style={{ marginTop: 12 }}>
            <Label>IP 선택</Label>
            <Select
              value={selectedIpId}
              onChange={setSelectedIpId}
              placeholder="IP 선택"
              options={ips.map((ip) => ({ value: ip.id, label: ip.name }))}
            />

            <Label>쿠지 시리즈 선택</Label>
            <Select
              value={selectedSeriesId}
              onChange={setSelectedSeriesId}
              placeholder={
                selectedIpId ? "쿠지 시리즈 선택" : "IP를 먼저 선택하세요"
              }
              disabled={!selectedIpId}
              options={seriesList.map((s) => ({ value: s.id, label: s.name }))}
            />
          </div>
        )}
      </Card>

      {/* 기본 입력 */}
      <Card>
        <Label>남은 쿠지 수</Label>
        <NumberInput value={remainCount} onChange={setRemainCount} />

        <Label>1회 가격 (원)</Label>
        <PriceInput
          value={pricePerTryInput}
          onChange={(v) => {
            setPricePerTryInput(v);
            setPricePerTry(parseNumber(v));
          }}
        />

        <Label>라스트원 가치 (원)</Label>
        <PriceInput
          value={lastOnePriceInput}
          onChange={(v) => {
            setLastOnePriceInput(v);
            setLastOnePrice(parseNumber(v));
          }}
        />
      </Card>

      {/* 상위상 */}
      <Card>
        <h4>상위상 현황</h4>
        {prizes.map((p, i) => (
          <div
            key={p.grade}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr 1fr",
              gap: 8,
              marginBottom: 8,
              alignItems: "center",
            }}
          >
            <strong>{p.grade}</strong>
            <NumberInput
              value={p.count}
              onChange={(v) => {
                const next = [...prizes];
                next[i] = { ...p, count: v };
                setPrizes(next);
              }}
            />
            <PriceInput
              value={formatNumber(p.price)}
              onChange={(v) => {
                const next = [...prizes];
                next[i] = { ...p, price: parseNumber(v) };
                setPrizes(next);
              }}
            />
          </div>
        ))}
      </Card>

      {/* 통털이 */}
      <Card>
        <strong>🧮 통털이 결과</strong>
        <div
          style={{
            marginTop: 8,
            color: allDrawDiff >= 0 ? "#16a34a" : "#dc2626",
            fontWeight: 600,
          }}
        >
          {allDrawDiff >= 0 ? "이득" : "손해"} (
          {allDrawDiff >= 0 ? "+" : ""}
          {allDrawDiff.toLocaleString()}원)
        </div>
      </Card>
    </div>
  );
}

/* ================== UI ================== */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, marginBottom: 6 }}>{children}</div>;
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
    />
  );
}

function PriceInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onFocus={() => value === "0" && onChange("")}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        onChange(raw ? formatNumber(Number(raw)) : "");
      }}
      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  options: { value: number; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value ?? ""} // ✅ controlled
      disabled={disabled}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      style={{
        width: "100%",
        padding: "10px 36px 10px 10px",
        borderRadius: 8,
        border: "1px solid #ccc",
        marginBottom: 8,
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 7l5 5 5-5' fill='none' stroke='%23999' stroke-width='2'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        backgroundSize: "16px",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
