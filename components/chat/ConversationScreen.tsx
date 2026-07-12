"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Conversation } from "@/utils/chat";
import { CHAT_EVENT, getConversations } from "@/utils/chat";

type ConversationScreenProps = {
  conversationId: string;
};

export function ConversationScreen({ conversationId }: ConversationScreenProps) {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const syncConversations = () => setConversations(getConversations());

    syncConversations();
    window.addEventListener(CHAT_EVENT, syncConversations);
    window.addEventListener("storage", syncConversations);

    return () => {
      window.removeEventListener(CHAT_EVENT, syncConversations);
      window.removeEventListener("storage", syncConversations);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        query={query}
        onQueryChange={setQuery}
      />

      <section className="mx-auto max-w-[1504px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="hidden lg:block">
            <ChatList
              conversations={conversations}
              activeConversationId={conversationId}
            />
          </div>
          <ChatWindow conversationId={conversationId} />
        </div>
      </section>
    </main>
  );
}
