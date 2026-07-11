"use client";

import { useCallback, useRef, useState } from "react";
import PreviewImage from "./PreviewImage";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_EXT = ".jpg,.jpeg,.png,.webp";
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadCard({
  file,
  previewUrl,
  onFileSelect,
  onRemove,
  onAnalyze,
  isAnalyzing,
  error,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const validateAndSet = useCallback(
    (selectedFile) => {
      setLocalError("");
      if (!selectedFile) return;

      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        setLocalError(`Unsupported format. Please upload JPG, PNG, or WEBP.`);
        return;
      }
      if (selectedFile.size > MAX_SIZE_BYTES) {
        setLocalError(`File too large. Max ${MAX_SIZE_MB}MB allowed.`);
        return;
      }
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSet(selected);
  };

  const triggerFileDialog = () => {
    inputRef.current?.click();
  };

  const displayError = localError || error;

  return (
    <div className="relative">
      <div className="rounded-[24px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-[14px]">🌿</span>
            <h3 className="text-[14px] font-bold tracking-tight text-gray-900">Add Your Leaf Photo</h3>
          </div>
          <span className="text-[11px] font-medium text-gray-400">JPG, PNG, WEBP • Max {MAX_SIZE_MB}MB</span>
        </div>

        <div className="p-4 sm:p-6">
          {!previewUrl ? (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={triggerFileDialog}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed px-6 py-10 sm:py-14 transition-all ${
                  isDragging
                    ? "border-emerald-400 bg-emerald-50/80 scale-[0.99]"
                    : "border-gray-200 bg-gray-50/50 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                <div className="pointer-events-none">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 group-hover:shadow-md transition">
                    <span className="text-2xl">📸</span>
                  </div>
                  <p className="mt-4 text-center text-[15px] font-semibold text-gray-900">
                    {isDragging ? "Drop your photo here" : "Drag & drop your leaf photo"}
                  </p>
                  <p className="mt-1 text-center text-[13px] text-gray-500">
                    or click to browse from your device
                  </p>
                  <div className="mt-5 flex justify-center gap-2">
                    {["Tomato", "Potato", "Corn", "Apple"].map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-[16px] opacity-[0.03]" style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px"
                }} />
              </div>

              <input ref={inputRef} type="file" accept={ACCEPTED_EXT} className="hidden" onChange={handleInputChange} />
            </>
          ) : (
            <>
              <PreviewImage previewUrl={previewUrl} fileName={file?.name} fileSize={file?.size} onRemove={onRemove} onReplace={triggerFileDialog} />
              <input ref={inputRef} type="file" accept={ACCEPTED_EXT} className="hidden" onChange={handleInputChange} />
            </>
          )}

          {displayError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 ring-1 ring-red-100">
              <span className="mt-0.5">⚠️</span>
              <span className="leading-snug whitespace-pre-wrap">{displayError}</span>
            </div>
          )}

          <div className="mt-6">
            <button
              disabled={!file || isAnalyzing}
              onClick={onAnalyze}
              className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-[14px] font-bold transition-all ${
                !file || isAnalyzing
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-[1px] active:translate-y-0"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Checking Plant Health...
                </>
              ) : (
                <>
                  <span className="text-[16px]">✦</span>
                  Check Plant Health
                  <span className="ml-1 opacity-70 group-hover:translate-x-0.5 transition-transform">→</span>
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              Private & secure • No photos saved • Instant guidance
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-gray-500">
        <span className="h-px w-8 bg-gray-200"></span>
        <span>💡 Tip: Use natural daylight for a clearer photo</span>
        <span className="h-px w-8 bg-gray-200"></span>
      </div>
    </div>
  );
}
