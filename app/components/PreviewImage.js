"use client";

export default function PreviewImage({ previewUrl, fileName, fileSize, onRemove, onReplace }) {
  if (!previewUrl) return null;

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-gray-200 bg-white p-3 shadow-sm">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={fileName || "Preview"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow">
            🍃 Leaf sample
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-gray-900">{fileName}</p>
          <p className="mt-0.5 text-[11px] text-gray-500">{formatSize(fileSize)} • Ready to analyze</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReplace}
            className="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Replace
          </button>
          <button
            onClick={onRemove}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-black transition"
            title="Remove image"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
