import { Download, FileText } from "lucide-react";
import type { Message } from "@/utils/chat";
import {
  formatAttachmentSize,
  isImageAttachment,
  parseMessageContent
} from "@/lib/chat/attachments";

type MessageBubbleProps = {
  message: Message;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBuyer = message.sender === "buyer";
  const content = parseMessageContent(message.text);

  return (
    <div className={`flex ${isBuyer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[22px] px-4 py-3 shadow-sm ${
          isBuyer
            ? "rounded-br-md bg-leaf text-white"
            : "rounded-bl-md bg-white text-ink"
        }`}
      >
        {content.attachments.length > 0 ? (
          <div className="mb-2 grid gap-2">
            {content.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.dataUrl}
                download={attachment.name}
                target="_blank"
                rel="noreferrer"
                className={`block overflow-hidden rounded-2xl border transition ${
                  isBuyer
                    ? "border-white/20 bg-white/12 hover:bg-white/18"
                    : "border-ink/10 bg-mist hover:border-leaf/30"
                }`}
              >
                {isImageAttachment(attachment) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.dataUrl}
                    alt={attachment.name}
                    className="max-h-72 w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                        isBuyer ? "bg-white/16 text-white" : "bg-white text-leaf"
                      }`}
                    >
                      <FileText size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {attachment.name}
                      </span>
                      <span
                        className={`text-xs ${isBuyer ? "text-white/70" : "text-ink/50"}`}
                      >
                        {formatAttachmentSize(attachment.size)}
                      </span>
                    </span>
                    <Download size={17} className="shrink-0 opacity-75" />
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : null}

        {content.text ? (
          <p className="whitespace-pre-line text-sm leading-6">{content.text}</p>
        ) : null}
        <p className={`mt-1 text-right text-[11px] ${isBuyer ? "text-white/70" : "text-ink/42"}`}>
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
