"use client";

import type { Conversation } from "@/utils/chat";
import { getLastMessage } from "@/utils/chat";
import { getListingById } from "@/utils/listings";
import { ChatListItem } from "./ChatListItem";

type ChatListProps = {
  conversations: Conversation[];
  activeConversationId?: string;
};

export function ChatList({ conversations, activeConversationId }: ChatListProps) {
  return (
    <aside className="rounded-[24px] bg-white p-3 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <ChatListItem
            key={conversation.id}
            conversation={conversation}
            listing={conversation.listing ?? getListingById(conversation.listingId)}
            lastMessage={conversation.lastMessage ?? getLastMessage(conversation.id)}
            active={conversation.id === activeConversationId}
          />
        ))}
      </div>
    </aside>
  );
}
