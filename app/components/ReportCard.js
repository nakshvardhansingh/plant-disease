"use client";

import { useState } from "react";

function Card({ icon, title, children, accent = "emerald" }) {
  const accents = {
    emerald: "bg-emerald-50 ring-emerald-100 text-emerald-700",
    lime: "bg-lime-50 ring-lime-100 text-lime-700",
    amber: "bg-amber-50 ring-amber-100 text-amber-700",
    red: "bg-red-50 ring-red-100 text-red-700",
    blue: "bg-blue-50 ring-blue-100 text-blue-700",
    violet: "bg-violet-50 ring-violet-100 text-violet-700",
    gray: "bg-gray-50 ring-gray-200 text-gray-700",
  };

  return (
    <div className="group relative rounded-[20px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-gray-100 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]">
      <div className="flex items-start gap-3.5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${accents[accent] || accents.emerald} text-[18px]`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] font-bold uppercase tracking-widest text-gray-900">{title}</h4>
          <div className="mt-3 text-[14px] leading-relaxed text-gray-600">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ConfidenceBar({ value }) {
  // value can be "95%" or 95 or "High"
  let numeric = 0;
  if (typeof value === "string") {
    const match = value.match(/(\d+)/);
    if (match) numeric = parseInt(match[1], 10);
    else {
      // map textual
      if (value.toLowerCase().includes("high")) numeric = 90;
      else if (value.toLowerCase().includes("medium") || value.toLowerCase().includes("moderate")) numeric = 65;
      else if (value.toLowerCase().includes("low")) numeric = 35;
      else numeric = 75;
    }
  } else if (typeof value === "number") numeric = value;
  else numeric = 70;

  const safe = Math.min(100, Math.max(5, numeric));
  const color = safe >= 80 ? "from-emerald-500 to-green-500" : safe >= 50 ? "from-amber-500 to-yellow-500" : "from-red-400 to-orange-400";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-gray-500">Confidence</span>
        <span className="text-[12px] font-bold text-gray-900">{typeof value === "string" ? value : `${safe}%`}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

function SeverityPill({ severity }) {
  const s = (severity || "").toLowerCase();
  let cls = "bg-gray-100 text-gray-700 ring-gray-200";
  if (s.includes("low") || s.includes("mild")) cls = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  else if (s.includes("moderate") || s.includes("medium")) cls = "bg-amber-50 text-amber-800 ring-amber-200";
  else if (s.includes("high") || s.includes("severe") || s.includes("critical")) cls = "bg-red-50 text-red-700 ring-red-200";
  else if (s.includes("healthy")) cls = "bg-green-50 text-green-700 ring-green-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold ring-1 ${cls}`}>
      {severity || "Unknown"}
    </span>
  );
}

function ListItems({ items }) {
  if (!items || items.length === 0) return <span className="text-gray-400">No data available</span>;
  const list = Array.isArray(items) ? items : [items];
  return (
    <ul className="space-y-2">
      {list.map((it, idx) => (
        <li key={idx} className="flex gap-2.5">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"></span>
          <span className="leading-snug">{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportCard({ report }) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = `🌿 Plant: ${report.plant_name || "Unknown"}\n🦠 Issue: ${report.disease || "Unknown"}\n📈 Confidence: ${report.confidence || "N/A"}\n\nReport from PhytoScan - Plant Health Checker`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Plant Disease Report", text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Summary Header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 p-[1px]">
        <div className="rounded-[23px] bg-gradient-to-br from-gray-900 to-[#0f1a14] p-6 sm:p-8 relative">
          {/* Decor glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-[60px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-lime-400/10 blur-[50px]" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">🌱</span>
                <span className="text-[11px] font-bold tracking-[0.2em] text-emerald-300 uppercase">AI Diagnosis Complete</span>
              </div>
              <h2 className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">
                {report.plant_name || "Unknown Plant"}
                <span className="mx-3 text-white/20 font-light">—</span>
                <span className="font-medium text-white/90">{report.disease || "Analysis Result"}</span>
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SeverityPill severity={report.severity} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/80 ring-1 ring-white/10">
                  📈 {report.confidence || "N/A"} confidence
                </span>
                {report.plant_name && report.plant_name.toLowerCase() !== "unknown" && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-[12px] font-medium text-emerald-200 ring-1 ring-emerald-500/20">
                    Species detected
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:flex-col md:flex-row">
              <button onClick={handleCopy} className="inline-flex h-9 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-gray-900 px-4 hover:bg-gray-100 transition">
                {copied ? "✓ Copied" : "⎙ Copy JSON"}
              </button>
              <button onClick={handleDownload} className="inline-flex h-9 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-white px-4 ring-1 ring-white/20 hover:bg-white/20 transition">
                ⤓ Export
              </button>
              <button onClick={handleShare} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 transition">
                ↗
              </button>
            </div>
          </div>

          {/* Subtle confidence visual */}
          <div className="relative mt-8 max-w-md">
            <ConfidenceBar value={report.confidence} />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card icon="🔍" title="Visible Symptoms" accent="amber">
          <ListItems items={report.symptoms} />
        </Card>

        <Card icon="🧪" title="Possible Causes" accent="violet">
          <ListItems items={report.possible_causes} />
        </Card>

        <Card icon="💊" title="Recommended Treatment" accent="blue">
          <ListItems items={report.recommended_treatment} />
        </Card>

        <Card icon="🌿" title="Organic Solutions" accent="emerald">
          <ListItems items={report.organic_solution} />
        </Card>

        <Card icon="🧴" title="Chemical Solutions" accent="red">
          <>
            <ListItems items={report.chemical_solution} />
            <p className="mt-3 text-[11px] text-gray-400 italic">Always follow label instructions and local regulations. Wear PPE.</p>
          </>
        </Card>

        <Card icon="🛡️" title="Prevention Tips" accent="lime">
          <ListItems items={report.prevention} />
        </Card>

        {/* Additional Notes - spans full */}
        <div className="md:col-span-2">
          <Card icon="📝" title="Additional Notes & Care Advice" accent="gray">
            <p className="leading-relaxed whitespace-pre-wrap">{report.additional_notes || "No additional notes."}</p>
            {report?.disclaimer || (
              <p className="mt-4 rounded-xl bg-gray-50 p-3 text-[12px] leading-relaxed text-gray-500 ring-1 ring-gray-100">
                ⚠️ This AI analysis is for informational purposes. For severe infestations or commercial crops, consult a local agronomist or plant pathologist. If image quality was low, try re-uploading a clearer, well-lit leaf photo.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Reassurance footer */}
      <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-gray-400">
        <span className="h-px w-12 bg-gray-200"></span>
        <span>Confidence scores are estimates • Not a substitute for lab testing</span>
        <span className="h-px w-12 bg-gray-200"></span>
      </div>
    </div>
  );
}
