"use client";

import Image from "next/image";
import Link from "next/link";
import type { Conversation, Message } from "@/utils/chat";
import { hasUnreadConversation } from "@/utils/chat";
import type { Listing } from "@/utils/listings";

type ChatListItemProps = {
  conversation: Conversation;
  listing?: Listing;
  lastMessage?: Message;
  active?: boolean;
};

function formatChatTime(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ChatListItem({
  conversation,
  listing,
  lastMessage,
  active
}: ChatListItemProps) {
  const unread = hasUnreadConversation(conversation.id);
  const title = listing?.titleRu ?? listing?.title ?? "Объявление";

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className={`focus-ring grid grid-cols-[64px_1fr] gap-3 rounded-[20px] p-3 transition ${
        active ? "bg-mist ring-1 ring-leaf/20" : "hover:bg-mist/70"
      }`}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-mist">
        {listing?.image ? (
          <Image
            src={listing.image}
            alt={title}
            fill
            unoptimized={listing.image.startsWith("data:")}
            className="object-cover"
            sizes="64px"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{conversation.sellerName}</p>
            <p className="truncate text-sm text-ink/52">{title}</p>
          </div>
          <span className="shrink-0 text-xs text-ink/45">
            {formatChatTime(lastMessage?.createdAt ?? conversation.updatedAt)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm text-ink/58">
            {lastMessage?.text ?? "Диалог создан"}
          </p>
          {unread ? <span className="h-2.5 w-2.5 rounded-full bg-leaf" /> : null}
        </div>
      </div>
    </Link>
  );
}
