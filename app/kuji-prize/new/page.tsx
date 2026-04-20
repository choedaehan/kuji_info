"use client";

import { useEffect, useState } from "react";

/* ================== types ================== */

type Ip = {
  id: number;
  name: string;
};

type KujiSeries = {
  id: number;
  name: string;
};

/* ================== styles ================== */

const pageStyle: React.CSSProperties = {
  maxWidth: 520,
  margin: "0 auto",
  padding: 16,
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 16px 0",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 13,
  marginBottom: 6,
  fontWeight: 500,
};

const controlStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};

const disabledControlStyle: React.CSSProperties = {
  ...controlStyle,
  background: "#f3f4f6",
  color: "#6b7280",
  cursor: "not-allowed",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  padding: "10px 0",
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: 15,
  cursor: "pointer",
};

/* ================== utils ================== */

const formatNumber = (value: number) =>
  value.toLocaleString("ko-KR");

const parseNumber = (value: string) =>
  Number(value.replace(/,/g, ""));

/* ================== page ================== */

export default function KujiPrizeCreatePage() {
  const [ips, setIps] = useState<Ip[]>([]);
  const [seriesList, setSeriesList] = useState<KujiSeries[]>([]);

  const [selectedIpId, setSelectedIpId] = useState<number | null>(null);

  const [form, setForm] = useState({
    kujiSeriesId: "",
    grade: "A",
    name: "",
    productType: "",
    thumbnailImageUrl: "",
    totalCount: 1,
    price: 0, // ✅ 저장용 number
  });

  // 🔥 가격 입력 표시용
  const [priceInput, setPriceInput] = useState("0");

  /* ---------- IP 목록 ---------- */
  useEffect(() => {
    fetch("/api/ip")
      .then(res => res.json())
      .then(setIps);
  }, []);

  /* ---------- IP 선택 → 쿠지 시리즈 목록 ---------- */
  useEffect(() => {
    if (!selectedIpId) {
      setSeriesList([]);
      setForm(prev => ({ ...prev, kujiSeriesId: "" }));
      return;
    }

    fetch(`/api/kuji-series?ipId=${selectedIpId}`)
      .then(res => res.json())
      .then(setSeriesList);
  }, [selectedIpId]);

  /* ---------- submit ---------- */
  const submit = async () => {
    if (!selectedIpId) {
      alert("IP를 선택하세요");
      return;
    }

    if (!form.kujiSeriesId) {
      alert("쿠지 시리즈를 선택하세요");
      return;
    }

    await fetch("/api/kuji-prize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseNumber(priceInput),
      }),
    });

    alert("프라이즈 생성 완료");

    setForm(prev => ({
      ...prev,
      name: "",
      productType: "",
      thumbnailImageUrl: "",
      totalCount: 1,
      price: 0,
    }));
    setPriceInput("0");
  };

  /* ---------- render ---------- */

  const seriesSelectDisabled = !selectedIpId;

  return (
    <div style={pageStyle}>
      <h2 style={titleStyle}>🎁 쿠지 프라이즈 생성</h2>

      {/* IP 선택 */}
      <Field label="IP (필수)">
        <select
          style={controlStyle}
          value={selectedIpId ?? ""}
          onChange={e =>
            setSelectedIpId(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">IP 선택</option>
          {ips.map(ip => (
            <option key={ip.id} value={ip.id}>
              {ip.name}
            </option>
          ))}
        </select>
      </Field>

      {/* 쿠지 시리즈 선택 */}
      <Field label="쿠지 시리즈 (필수)">
        <select
          style={seriesSelectDisabled ? disabledControlStyle : controlStyle}
          value={form.kujiSeriesId}
          disabled={seriesSelectDisabled}
          onChange={e => setForm({ ...form, kujiSeriesId: e.target.value })}
        >
          <option value="">
            {selectedIpId ? "쿠지 시리즈 선택" : "IP를 먼저 선택하세요"}
          </option>
          {seriesList.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      {/* 프라이즈 정보 */}
      <Field label="등급">
        <select
          style={controlStyle}
          value={form.grade}
          onChange={e => setForm({ ...form, grade: e.target.value })}
        >
          {["A", "B", "C", "D", "E"].map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Field>

      <Field label="상품명">
        <input
          style={controlStyle}
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      <Field label="상품 타입">
        <input
          style={controlStyle}
          placeholder="figure / acrylic / poster 등"
          value={form.productType}
          onChange={e => setForm({ ...form, productType: e.target.value })}
        />
      </Field>

      <Field label="썸네일 URL">
        <input
          style={controlStyle}
          value={form.thumbnailImageUrl}
          onChange={e =>
            setForm({ ...form, thumbnailImageUrl: e.target.value })
          }
        />
      </Field>

      <Field label="총 개수">
        <input
          style={controlStyle}
          type="number"
          value={form.totalCount}
          onChange={e =>
            setForm({ ...form, totalCount: Number(e.target.value) })
          }
        />
      </Field>

      {/* 🔥 가격 입력 (UX 개선 완료) */}
      <Field label="가격 (원)">
        <input
          style={controlStyle}
          type="text"
          inputMode="numeric"
          value={priceInput}
          placeholder="0"
          onFocus={() => {
            if (priceInput === "0") setPriceInput("");
          }}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const numberValue = raw ? Number(raw) : 0;

            setPriceInput(raw ? formatNumber(numberValue) : "");
            setForm(prev => ({ ...prev, price: numberValue }));
          }}
        />
      </Field>

      <button onClick={submit} style={buttonStyle}>
        생성
      </button>
    </div>
  );
}

/* ================== UI ================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={fieldLabelStyle}>{label}</div>
      {children}
    </div>
  );
}
