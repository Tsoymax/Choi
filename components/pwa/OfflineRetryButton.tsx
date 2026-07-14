"use client";

export function OfflineRetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="focus-ring mt-7 rounded-full bg-leaf px-7 py-3 text-base font-bold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
    >
      Попробовать снова
    </button>
  );
}
