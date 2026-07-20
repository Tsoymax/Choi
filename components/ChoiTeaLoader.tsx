type ChoiTeaLoaderProps = {
  label?: string;
  className?: string;
};

export function ChoiTeaLoader({
  label = "Загрузка",
  className = ""
}: ChoiTeaLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)] ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="choi-tea-loader" aria-hidden="true">
        <svg viewBox="0 0 220 150" className="h-28 w-44">
          <g className="choi-teapot">
            <path
              d="M63 58c18-22 58-22 75 0 12 1 24 10 24 25 0 19-16 34-49 34H83c-33 0-49-15-49-34 0-15 14-24 29-25Z"
              fill="#4f815c"
            />
            <path
              d="M82 52c1-14 12-24 26-24s25 10 26 24"
              fill="none"
              stroke="#4f815c"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <path
              d="M153 67h16c12 0 20 8 20 19s-8 19-20 19h-15"
              fill="none"
              stroke="#4f815c"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M36 70 12 82c-6 3-6 10 0 13l24 12"
              fill="none"
              stroke="#4f815c"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="102" cy="82" r="13" fill="#f7f5ef" />
            <path
              d="M78 98c12 10 39 10 51 0"
              fill="none"
              stroke="#f7f5ef"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M127 68c12-12 25-18 42-21-5 15-15 26-31 33"
              fill="#8abf3f"
            />
          </g>
          <path
            className="choi-tea-stream"
            d="M24 96c26 19 62 26 111 24"
            fill="none"
            stroke="#8abf3f"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="42 70"
          />
          <g className="choi-cup">
            <path
              d="M126 121h60c-2 15-14 24-30 24s-28-9-30-24Z"
              fill="#f7f5ef"
              stroke="#4f815c"
              strokeWidth="5"
            />
            <path
              d="M186 124h10c8 0 13 5 13 12s-5 12-13 12h-8"
              fill="none"
              stroke="#4f815c"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              className="choi-cup-fill"
              d="M137 126h38"
              stroke="#8abf3f"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      <p className="mt-4 text-base font-semibold text-ink">{label}</p>
      <p className="mt-1 text-sm text-ink/55">Наливаем чай и готовим данные</p>
    </div>
  );
}
