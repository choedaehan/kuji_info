// app/kuji-series/new/page.tsx
"use client";

import { useEffect, useState } from "react";

type IP = {
  id: number;
  name: string;
};

export default function KujiSeriesCreatePage() {
  const [ipList, setIpList] = useState<IP[]>([]);
  const [form, setForm] = useState({
    ipId: "",
    name: "",
    totalCellCount: "",
    releaseDate: "",
    officialUrl: "",
    thumbnailImageUrl: "",
  });

  useEffect(() => {
    fetch("/api/ip")
      .then((res) => res.json())
      .then(setIpList);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.ipId || !form.name) {
      alert("IP와 시리즈명은 필수야");
      return;
    }

    await fetch("/api/kuji-series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Kuji Series 생성 완료");
  };

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "40px auto",
        padding: 24,
        border: "1px solid #ddd",
        borderRadius: 8,
        fontSize: 14,
      }}
    >
      <h2 style={{ marginBottom: 24 }}>🎯 Kuji Series 생성</h2>

      {/* IP */}
      <Field label="IP">
        <select
          name="ipId"
          value={form.ipId}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">IP 선택</option>
          {ipList.map((ip) => (
            <option key={ip.id} value={ip.id}>
              {ip.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Series Name */}
      <Field label="시리즈명">
        <input
          name="name"
          placeholder="예: 체인소맨 1번쿠지"
          onChange={handleChange}
          style={inputStyle}
        />
      </Field>

      {/* Total Cell */}
      <Field label="총 셀 개수">
        <input
          name="totalCellCount"
          type="number"
          placeholder="예: 80"
          onChange={handleChange}
          style={inputStyle}
        />
      </Field>

      {/* Release Date */}
      <Field label="발매일">
        <input
          name="releaseDate"
          type="date"
          onChange={handleChange}
          style={inputStyle}
        />
      </Field>

      {/* URL */}
      <Field label="공식 URL">
        <input
          name="officialUrl"
          placeholder="https://..."
          onChange={handleChange}
          style={inputStyle}
        />
      </Field>

      {/* Thumbnail */}
      <Field label="썸네일 이미지 URL">
        <input
          name="thumbnailImageUrl"
          placeholder="https://image..."
          onChange={handleChange}
          style={inputStyle}
        />
      </Field>

      <div style={{ marginTop: 32, textAlign: "right" }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: "8px 16px",
            background: "#111",
            color: "#fff",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          생성
        </button>
      </div>
    </div>
  );
}

/* ===== 공용 ===== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 4,
};
