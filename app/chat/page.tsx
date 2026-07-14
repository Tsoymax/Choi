"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import type { Language } from "@/components/i18n";
import { ChatList } from "@/components/chat/ChatList";
import type { Conversation } from "@/utils/chat";
import { CHAT_EVENT, getConversations } from "@/utils/chat";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import { getConversationsByUserId } from "@/lib/data/conversations";
import { createClient } from "@/utils/supabase/client";

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>("ru");
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    async function syncConversations() {
      const localConversations = getConversations();

      if (!hasSupabaseBrowserEnv()) {
        setConversations(localConversations);
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        setConversations(localConversations);
        return;
      }

      const supabase = createClient();
      const remoteConversations = await getConversationsByUserId(supabase, user.id);
      setConversations([...remoteConversations, ...localConversations]);
    }

    void syncConversations();
    const intervalId = setInterval(syncConversations, 5000);
    window.addEventListener(CHAT_EVENT, syncConversations);
    window.addEventListener("storage", syncConversations);

    return () => {
      clearInterval(intervalId);
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

      <section className="mx-auto max-w-[1504px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Сообщения
          </h1>
        </div>

        {conversations.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <ChatList conversations={conversations} />
            <section className="hidden rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)] lg:grid lg:place-items-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mist text-leaf">
                  <MessageCircle size={30} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-ink">
                  Выберите диалог
                </h2>
                <p className="mt-2 text-ink/58">
                  Откройте сообщение слева, чтобы продолжить разговор.
                </p>
              </div>
            </section>
          </div>
        ) : (
          <section className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)] sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mist text-leaf">
              <MessageCircle size={30} />
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-ink">Пока нет сообщений</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg leading-8 text-ink/62">
              Откройте объявление и напишите продавцу
            </p>
            <Link
              href="/"
              className="focus-ring mt-7 inline-flex h-14 items-center justify-center rounded-full bg-leaf px-7 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
            >
              Смотреть объявления
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}
