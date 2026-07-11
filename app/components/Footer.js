"use client";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                <span className="text-[18px]">🌿</span>
              </div>
              <span className="text-[16px] font-bold tracking-tight">PhytoScan</span>
            </div>
            <p className="mt-4 max-w-[380px] text-[14px] leading-relaxed text-gray-500">
              Helping farmers and gardeners spot plant issues early. Upload a single leaf photo to understand possible problems and get simple, actionable care tips. Your photos stay private and are never stored.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Private & Secure
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600 border">
                No Photo Storage
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-gray-900">Features</h4>
            <ul className="mt-4 space-y-3 text-[14px] text-gray-500">
              <li><a href="#" className="hover:text-gray-900">Instant Diagnosis</a></li>
              <li><a href="#" className="hover:text-gray-900">Care Guidance</a></li>
              <li><a href="#" className="hover:text-gray-900">Prevention Tips</a></li>
              <li><a href="#" className="hover:text-gray-900">Crop Library</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-gray-900">Support</h4>
            <ul className="mt-4 space-y-3 text-[14px] text-gray-500">
              <li><a href="#" className="hover:text-gray-900">Plant Care Guide</a></li>
              <li><a href="#" className="hover:text-gray-900">Common Diseases</a></li>
              <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
              <li><a href="#" className="hover:text-gray-900">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-[13px] text-gray-400">© {new Date().getFullYear()} PhytoScan. For healthier crops and happier gardens.</p>
          <p className="text-[12px] text-gray-400 flex items-center gap-2">
            <span>🌱</span>
            <span>Made for farmers, gardeners & researchers</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
