"use client";

import { useState } from "react";
import { X } from "lucide-react";

type ModerationActionModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (note: string) => void;
};

export function ModerationActionModal({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  loading = false,
  onCancel,
  onConfirm
}: ModerationActionModalProps) {
  const [note, setNote] = useState("");

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] bg-ink/35 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-20 max-w-lg rounded-[28px] bg-white p-6 shadow-[0_24px_90px_rgba(24,32,29,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/58">{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-ink">Комментарий модератора</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Например: причина скрытия, предупреждение или внутренний комментарий."
            className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink shadow-sm outline-none focus:border-leaf"
          />
        </label>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(note)}
            className={`focus-ring h-12 rounded-full px-5 text-sm font-semibold text-white transition disabled:opacity-60 ${
              danger ? "bg-coral hover:bg-[#d95a49]" : "bg-leaf hover:bg-[#3f6d4d]"
            }`}
          >
            {loading ? "Сохраняем..." : confirmLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="focus-ring h-12 rounded-full bg-mist px-5 text-sm font-semibold text-ink disabled:opacity-60"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
