"use client";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex h-[64px] items-center justify-between rounded-[20px] glass-dark px-5 sm:px-7 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
              <span className="text-[18px]">🌿</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-gray-900 leading-none">
                PhytoScan
              </span>
              <span className="text-[11px] font-medium tracking-widest text-emerald-600 uppercase leading-none mt-[2px]">
                Plant Health
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full bg-gray-100/80 px-1.5 py-1">
            <a href="#detector" className="rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-gray-900 shadow-sm">Detector</a>
            <a href="#" className="px-4 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition">How it works</a>
            <a href="#" className="px-4 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition">Crops</a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-semibold text-emerald-700">Live • Instant Results</span>
            </div>
            <button className="hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-gray-900 px-5 text-[13px] font-semibold text-white hover:bg-black transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
