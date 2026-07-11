"use client";

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-lime-400 opacity-20 blur-2xl animate-pulse-slow"></div>
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-100"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin [animation-duration:0.9s]"></div>
            <div className="absolute inset-2 rounded-full border-2 border-lime-100"></div>
            <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-lime-400 border-b-transparent border-l-transparent animate-spin [animation-duration:1.2s] [animation-direction:reverse]"></div>
            <div className="absolute inset-0 grid place-items-center">
              <span className="animate-float text-2xl">🌱</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-[16px] font-semibold text-gray-900">Looking at your leaf...</h3>
        <p className="mt-1 text-[13px] text-gray-500">Checking color, spots, and texture for clues</p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]"></span>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]"></span>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500"></span>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-left">
          {[
            { label: "Identifying plant type", done: true },
            { label: "Checking for spots and discoloration", done: true },
            { label: "Understanding possible causes", done: false, active: true },
            { label: "Preparing care suggestions", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-[12px]">
              <div className={`h-5 w-5 grid place-items-center rounded-full border text-[10px] ${
                step.done ? "bg-emerald-500 border-emerald-500 text-white" : step.active ? "border-emerald-500 text-emerald-600 animate-pulse" : "border-gray-200 text-gray-300"
              }`}>
                {step.done ? "✓" : step.active ? "◐" : "○"}
              </div>
              <span className={`${step.done || step.active ? "text-gray-700 font-medium" : "text-gray-400"}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
