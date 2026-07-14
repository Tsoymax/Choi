"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { QuickReplies } from "./QuickReplies";

type MessageComposerProps = {
  onSend: (text: string) => void;
};

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState("");

  function submitMessage() {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    onSend(trimmedText);
    setText("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <div className="border-t border-ink/8 bg-white px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <QuickReplies onPick={setText} />
      <div className="flex items-end gap-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Напишите сообщение"
          className="focus-ring min-h-12 flex-1 resize-none rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm font-medium text-ink placeholder:text-ink/40"
        />
        <button
          type="button"
          onClick={submitMessage}
          className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
          aria-label="Отправить"
        >
          <Send size={19} />
        </button>
      </div>
    </div>
  );
}
