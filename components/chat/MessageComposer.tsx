"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { FileText, ImageIcon, Paperclip, Send, X } from "lucide-react";
import { QuickReplies } from "./QuickReplies";
import {
  formatAttachmentSize,
  isImageAttachment,
  type ChatAttachment
} from "@/lib/chat/attachments";

type MessageComposerProps = {
  onSend: (text: string, attachments?: ChatAttachment[]) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

function fileToAttachment(file: File): Promise<ChatAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `attachment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: String(reader.result)
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [error, setError] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearComposer() {
    setText("");
    setAttachments([]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function submitMessage() {
    const trimmedText = text.trim();
    if (!trimmedText && attachments.length === 0) {
      return;
    }

    onSend(trimmedText, attachments);
    clearComposer();
  }

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setError("");

    const freeSlots = MAX_FILES - attachments.length;
    if (freeSlots <= 0) {
      setError(`Можно отправить до ${MAX_FILES} файлов за раз.`);
      return;
    }

    const acceptedFiles = files.slice(0, freeSlots);
    const oversizedFile = acceptedFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      setError(`Файл «${oversizedFile.name}» больше 5 МБ.`);
      return;
    }

    setLoadingFiles(true);
    try {
      const nextAttachments = await Promise.all(acceptedFiles.map(fileToAttachment));
      setAttachments((current) => [...current, ...nextAttachments]);
    } catch {
      setError("Не удалось подготовить файл. Попробуйте выбрать его ещё раз.");
    } finally {
      setLoadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
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

      {attachments.length > 0 ? (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative flex min-w-[180px] items-center gap-3 rounded-2xl border border-ink/10 bg-mist p-2"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-leaf">
                {isImageAttachment(attachment) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.dataUrl}
                    alt={attachment.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText size={20} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{attachment.name}</p>
                <p className="text-xs text-ink/50">{formatAttachmentSize(attachment.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="focus-ring absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-ink shadow-sm"
                aria-label="Убрать файл"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="mb-2 rounded-2xl bg-[#fff2ef] px-3 py-2 text-sm font-semibold text-coral">
          {error}
        </p>
      ) : null}

      <div className="flex items-end gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFilesChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loadingFiles}
          className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-leaf/30 hover:text-leaf disabled:cursor-wait disabled:opacity-60"
          aria-label="Прикрепить файл"
        >
          {loadingFiles ? <ImageIcon size={19} /> : <Paperclip size={19} />}
        </button>
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
          disabled={loadingFiles || (!text.trim() && attachments.length === 0)}
          className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Отправить"
        >
          <Send size={19} />
        </button>
      </div>
    </div>
  );
}
