import type { Message } from "@/utils/chat";

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

  return (
    <div className={`flex ${isBuyer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[22px] px-4 py-3 shadow-sm ${
          isBuyer
            ? "rounded-br-md bg-leaf text-white"
            : "rounded-bl-md bg-white text-ink"
        }`}
      >
        <p className="whitespace-pre-line text-sm leading-6">{message.text}</p>
        <p className={`mt-1 text-right text-[11px] ${isBuyer ? "text-white/70" : "text-ink/42"}`}>
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
