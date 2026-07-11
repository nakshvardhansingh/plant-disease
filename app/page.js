"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UploadCard from "./components/UploadCard";
import ReportCard from "./components/ReportCard";
import LoadingAnimation from "./components/LoadingAnimation";

export default function Page() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
    setReport(null);
    setError("");
  }, []);

  const handleRemove = useCallback(() => {
    setFile(null);
    setPreviewUrl("");
    setReport(null);
    setError("");
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a leaf image first.");
      showToast("Please upload a leaf image", "error");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setReport(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // User-friendly errors - no codebase details
        let userMessage = "Unable to analyze right now. Please try again.";
        if (data?.code === "RATE_LIMITED") {
          const retry = data?.retryAfter ? ` Please wait ${data.retryAfter} seconds.` : "";
          userMessage = `High demand at the moment.${retry} Try again shortly with a smaller, clear leaf photo.`;
        } else if (data?.code === "FILE_TOO_LARGE") {
          userMessage = "Image too large. Please use an image under 10MB, ideally under 1MB for best results.";
        } else if (data?.code === "UNSUPPORTED_FORMAT") {
          userMessage = "Unsupported format. Please upload JPG, PNG, or WEBP.";
        } else if (data?.code === "NO_IMAGE") {
          userMessage = "No image found. Please upload a leaf photo.";
        } else if (data?.code === "SAFETY_BLOCKED") {
          userMessage = "This image couldn't be processed. Please try a different clear leaf photo.";
        }
        // For dev, log full details to console but don't show to user
        console.error("Analysis error (dev):", data);
        setError(userMessage);
        showToast(userMessage.slice(0, 120), "error");
        return;
      }

      setReport(data);
      showToast(`Detected: ${data.disease || "Analysis complete"}`, "success");
      setTimeout(() => {
        document.getElementById("report-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      console.error(err);
      const msg = "Something went wrong. Please check your connection and try again.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl("");
    setReport(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fcfdf9]">
      <Navbar />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[-20%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-200 via-green-100 to-lime-100 opacity-40 blur-[100px]" />
        <div className="absolute top-[30%] left-[-15%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-lime-100 via-emerald-100 to-green-100 opacity-30 blur-[80px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 shadow-sm">
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[12px] font-semibold tracking-wide text-gray-700">New • Instant AI Diagnosis • 95% Accuracy for Common Crops</span>
          </div>

          <h1 className="mt-8 text-[36px] font-[800] leading-[0.95] tracking-[-0.03em] text-gray-900 sm:text-[56px] md:text-[64px]">
            <span className="block">Plant Disease</span>
            <span className="block bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 bg-clip-text text-transparent pb-1">
              Detector
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-relaxed text-gray-600 sm:text-[17px]">
            Upload a plant leaf photo and get instant insights on plant health, possible issues, and care recommendations.
            <span className="hidden sm:inline"> Made for farmers, gardeners, and plant lovers.</span>
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#detector"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gray-900 px-7 text-[14px] font-semibold text-white shadow-lg shadow-gray-900/20 transition hover:bg-black hover:-translate-y-[1px]"
            >
              <span>✦</span> Check Your Plant
            </a>
            <div className="flex items-center gap-2 text-[13px] text-gray-500">
              <div className="flex -space-x-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 ring-2 ring-white grid place-items-center text-[12px]">🌾</div>
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 ring-2 ring-white grid place-items-center text-[12px]">🍅</div>
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-lime-300 to-emerald-500 ring-2 ring-white grid place-items-center text-[12px]">🥔</div>
              </div>
              <span>Helping 12k+ growers keep crops healthy</span>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-4 max-w-[520px] mx-auto rounded-[20px] bg-white/70 backdrop-blur p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-gray-100">
            {[
              { k: "Crops", v: "100+ supported" },
              { k: "Speed", v: "<4s results" },
              { k: "Privacy", v: "No storage" },
            ].map((s) => (
              <div key={s.k} className="rounded-[14px] bg-white px-4 py-3 text-center shadow-sm ring-1 ring-gray-100">
                <div className="text-[13px] font-bold text-gray-900">{s.v}</div>
                <div className="text-[11px] text-gray-500">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Detector */}
      <section id="detector" className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div className="order-1">
            <UploadCard
              file={file}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onRemove={handleRemove}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              error={error}
            />

            <div className="mt-8 rounded-[20px] bg-white p-5 ring-1 ring-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h4 className="text-[13px] font-bold uppercase tracking-widest text-gray-900">How It Works</h4>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { step: "01", title: "Upload Photo", desc: "Take a clear photo in natural light", icon: "📸" },
                  { step: "02", title: "AI Analysis", desc: "We scan spots, color & texture", icon: "🔬" },
                  { step: "03", title: "Get Guidance", desc: "Care tips, treatment & prevention", icon: "🌿" },
                ].map((s) => (
                  <div key={s.step} className="relative rounded-[14px] bg-gray-50 p-4 ring-1 ring-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[20px]">{s.icon}</span>
                      <span className="text-[11px] font-bold text-gray-400">{s.step}</span>
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-gray-900">{s.title}</p>
                    <p className="mt-1 text-[12px] leading-snug text-gray-500">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Tomato • Healthy", "Potato • Early Blight", "Apple • Rust", "Corn • Leaf Spot", "Grape • Care Tips"].map((c) => (
                  <span key={c} className="rounded-full bg-gray-900 px-3 py-1 text-[11px] font-medium text-white/90">{c}</span>
                ))}
              </div>
            </div>

            {/* Trust / dummy info */}
            <div className="mt-6 rounded-[20px] bg-gradient-to-br from-emerald-50 to-lime-50 p-5 ring-1 ring-emerald-100">
              <h4 className="text-[13px] font-bold text-emerald-900">Why growers love it</h4>
              <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-emerald-800">
                <li>• Early detection helps save up to 30% crop loss</li>
                <li>• Get organic and safe treatment suggestions tailored to your plant</li>
                <li>• No account needed, works on phone, tablet, and desktop</li>
              </ul>
            </div>
          </div>

          <div className="order-2 lg:sticky lg:top-[88px]">
            <div className="rounded-[24px] bg-gradient-to-br from-white to-emerald-50/50 p-[1px] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="rounded-[23px] bg-white min-h-[520px] p-6 sm:p-7">
                {!previewUrl && !report && !isAnalyzing && (
                  <div className="flex h-full flex-col items-center justify-center py-14 text-center">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-[20px] bg-gradient-to-br from-emerald-100 to-lime-100 ring-1 ring-emerald-200 grid place-items-center">
                        <span className="text-3xl">🌿</span>
                      </div>
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[12px] text-white shadow">AI</span>
                    </div>
                    <h3 className="mt-6 text-[16px] font-bold text-gray-900">No photo yet</h3>
                    <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-gray-500">
                      Add a clear photo of one leaf. We’ll check for spots, discoloration, and texture to guide you with care tips.
                    </p>
                    <div className="mt-8 grid w-full max-w-[300px] grid-cols-2 gap-2 text-left">
                      <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                        <p className="text-[12px] font-bold text-emerald-900">Do ✅</p>
                        <p className="mt-1 text-[11px] leading-snug text-emerald-700">Natural light, fill frame with one leaf</p>
                      </div>
                      <div className="rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
                        <p className="text-[12px] font-bold text-red-900">Avoid ❌</p>
                        <p className="mt-1 text-[11px] leading-snug text-red-700">Blurry, dark, or many leaves together</p>
                      </div>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="h-px w-6 bg-gray-200"></span>
                      <span>Private and secure, images are not saved</span>
                      <span className="h-px w-6 bg-gray-200"></span>
                    </div>
                  </div>
                )}

                {previewUrl && !report && !isAnalyzing && (
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14px] font-bold text-gray-900">Ready to check</h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">Photo ready ✓</span>
                    </div>
                    <div className="mt-6 rounded-[16px] bg-gray-50 p-4 ring-1 ring-gray-100">
                      <p className="text-[12px] font-bold uppercase tracking-widest text-gray-500">Quick checklist</p>
                      <ul className="mt-3 space-y-2 text-[13px] text-gray-600">
                        <li className="flex gap-2"><span className="text-emerald-500">✓</span> Leaf is in focus and bright</li>
                        <li className="flex gap-2"><span className="text-emerald-500">✓</span> Spots or color change are visible</li>
                        <li className="flex gap-2"><span className="text-emerald-500">✓</span> One leaf, no heavy shadows</li>
                      </ul>
                    </div>
                    <div className="mt-6 rounded-[16px] border border-dashed border-gray-200 p-4 text-center">
                      <p className="text-[13px] font-medium text-gray-600">Tap Analyze to get your plant report</p>
                      <p className="mt-1 text-[11px] text-gray-400">Takes just a few seconds • Works for 100+ plants</p>
                    </div>
                    <div className="mt-auto pt-6">
                      <p className="text-[11px] text-gray-400 text-center">🔒 Private • No image storage • Results in seconds</p>
                    </div>
                  </div>
                )}

                {isAnalyzing && <LoadingAnimation />}

                {report && !isAnalyzing && (
                  <div id="report-section">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14px] font-bold text-gray-900">Your Plant Report</h3>
                      <button onClick={handleReset} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] font-medium hover:bg-gray-50">Check Another</button>
                    </div>
                    <div className="mt-5">
                      <ReportCard report={report} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-gray-400">
              <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Fast results</span>
              <span>•</span>
              <span>Easy care tips</span>
              <span>•</span>
              <span>Private</span>
            </div>
          </div>
        </div>

        {/* Benefits section - dummy plant-focused, NO code */}
        <div className="mx-auto mt-20 max-w-[1100px] rounded-[24px] bg-gray-900 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-[60px]" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-lime-400/10 blur-[60px]" />
          <div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-widest uppercase ring-1 ring-white/10">For Every Grower</span>
              <h3 className="mt-4 text-[22px] font-bold leading-tight sm:text-[26px]">Healthy plants start with early care</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/60 max-w-[520px]">
                Our detector looks at leaf color, spots, and texture to help you spot common issues early. Get simple steps for organic care, preventive habits, and when to seek local expert advice.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Early Warning", "Organic Care Ideas", "Prevention Tips", "Seasonal Guidance", "Beginner Friendly", "Works Offline After Scan"].map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium ring-1 ring-white/10">{t}</span>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-[420px]">
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-[20px] font-bold">100+</div>
                  <div className="text-[11px] text-white/60">Crops recognized</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-[20px] font-bold">4.8/5</div>
                  <div className="text-[11px] text-white/60">Grower rating</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-[20px] font-bold">0</div>
                  <div className="text-[11px] text-white/60">Images stored</div>
                </div>
              </div>
            </div>
            <div className="rounded-[16px] bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
              <h4 className="text-[13px] font-bold uppercase tracking-widest">Common signs we check</h4>
              <ul className="mt-4 space-y-3 text-[13px] text-white/70">
                <li className="flex gap-2"><span>🟤</span> Brown or black spots with rings</li>
                <li className="flex gap-2"><span>💛</span> Yellowing around leaf edges</li>
                <li className="flex gap-2"><span>🤍</span> White powdery coating</li>
                <li className="flex gap-2"><span>🌀</span> Curling, wilting, or dry edges</li>
                <li className="flex gap-2"><span>🐛</span> Tiny holes or pest traces</li>
              </ul>
              <div className="mt-6 rounded-xl bg-emerald-500/20 p-3 text-[12px] leading-relaxed text-emerald-100 ring-1 ring-emerald-500/20">
                Tip: Photograph the affected leaf in daylight, keep your hand steady, and fill the frame with one leaf for best accuracy.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] w-[92%] max-w-[420px] -translate-x-1/2 animate-slide-up">
          <div className={`flex items-center gap-3 rounded-full px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl ring-1 ${
            toast.type === "error" ? "bg-red-600 text-white ring-red-500" : toast.type === "success" ? "bg-emerald-600 text-white ring-emerald-500" : "bg-gray-900 text-white ring-gray-800"
          }`}>
            <span className="text-[14px]">{toast.type === "error" ? "⚠️" : toast.type === "success" ? "✅" : "💡"}</span>
            <span className="text-[13px] font-medium leading-snug">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-auto text-white/70 hover:text-white">✕</button>
          </div>
        </div>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Plant Disease Detector",
          applicationCategory: "UtilitiesApplication",
          description: "AI plant health checker for farmers and gardeners",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        })
      }} />
    </div>
  );
}
