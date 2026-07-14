"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Conversation, Message } from "@/utils/chat";
import {
  CHAT_EVENT,
  getConversationById,
  getMessages,
  markConversationRead,
  sendMessage
} from "@/utils/chat";
import type { Listing } from "@/utils/listings";
import { getListingById as getLocalListingById } from "@/utils/listings";
import { getConfirmedDealsCount } from "@/utils/deals";
import { getCurrentUser, hasSupabaseBrowserEnv } from "@/lib/auth/client";
import {
  getConversationById as getRemoteConversationById,
  mapConversationRow
} from "@/lib/data/conversations";
import {
  getListingById as getRemoteListingById,
  mapListingRowToProduct
} from "@/lib/data/listings";
import {
  getMessagesByConversationId,
  mapMessageRow,
  sendMessage as sendRemoteMessage
} from "@/lib/data/messages";
import { createClient } from "@/utils/supabase/client";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { ListingChatCard } from "./ListingChatCard";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

type ChatWindowProps = {
  conversationId: string;
};

const sellerReplies = [
  "Ассалому алайкум! Да, объявление актуально.",
  "Здравствуйте! Да, ещё продаю."
];

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [conversation, setConversation] = useState<Conversation | undefined>(() =>
    getConversationById(conversationId)
  );
  const [messages, setMessages] = useState<Message[]>(() => getMessages(conversationId));
  const [listing, setListing] = useState<Listing | undefined>(() => {
    const initialConversation = getConversationById(conversationId);
    return initialConversation ? getLocalListingById(initialConversation.listingId) : undefined;
  });
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const confirmedDealsCount = listing?.sellerId ? getConfirmedDealsCount(listing.sellerId) : 0;

  useEffect(() => {
    const syncChat = () => {
      markConversationRead(conversationId);
      const nextConversation = getConversationById(conversationId);
      setConversation((current) => current?.remote ? current : nextConversation);
      if (nextConversation) {
        setListing((current) => current ?? getLocalListingById(nextConversation.listingId));
      }
      setMessages((current) => current.length > 0 ? current : getMessages(conversationId));
    };

    syncChat();
    window.addEventListener(CHAT_EVENT, syncChat);
    window.addEventListener("storage", syncChat);

    return () => {
      window.removeEventListener(CHAT_EVENT, syncChat);
      window.removeEventListener("storage", syncChat);
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function syncRemoteListing() {
      if (!hasSupabaseBrowserEnv()) {
        const nextConversation = getConversationById(conversationId);
        if (nextConversation) {
          setListing((current) => current ?? getLocalListingById(nextConversation.listingId));
        }
        setIsLoadingListing(false);
        return;
      }

      const supabase = createClient();
      const user = await getCurrentUser();

      if (!user) {
        setIsLoadingListing(false);
        return;
      }

      const userId = user.id;
      setCurrentUserId(userId);

      async function syncRemoteChat() {
        const remoteConversation = await getRemoteConversationById(supabase, conversationId);

        if (!mounted) {
          return;
        }

        if (!remoteConversation) {
          const localConversation = getConversationById(conversationId);
          if (localConversation) {
            setConversation(localConversation);
            setListing((current) =>
              current ?? getLocalListingById(localConversation.listingId)
            );
          }
          setIsLoadingListing(false);
          return;
        }

        const mappedConversation = mapConversationRow(remoteConversation, userId);
        setConversation(mappedConversation);
        if (mappedConversation.listing) {
          setListing(mappedConversation.listing as Listing);
        } else {
          const remoteListing = await getRemoteListingById(
            supabase,
            mappedConversation.listingId
          );

          if (remoteListing && mounted) {
            setListing(mapListingRowToProduct(remoteListing) as Listing);
          }
        }

        const remoteMessages = await getMessagesByConversationId(supabase, conversationId);
        if (mounted) {
          setMessages(remoteMessages.map((message) => mapMessageRow(message, userId)));
          setIsLoadingListing(false);
        }
      }

      await syncRemoteChat();
      intervalId = setInterval(syncRemoteChat, 3500);
    }

    void syncRemoteListing();

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function handleSend(text: string) {
    if (conversation?.remote && currentUserId) {
      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      const supabase = createClient();
      void sendRemoteMessage(supabase, conversationId, currentUserId, trimmedText).then(
        async () => {
          const remoteMessages = await getMessagesByConversationId(supabase, conversationId);
          setMessages(remoteMessages.map((message) => mapMessageRow(message, currentUserId)));
        }
      );
      return;
    }

    const previousMessages = getMessages(conversationId);
    const shouldAutoReply =
      previousMessages.filter((message) => message.sender === "buyer").length === 0 &&
      previousMessages.filter((message) => message.sender === "seller").length === 0;

    sendMessage(conversationId, "buyer", text);
    setMessages(getMessages(conversationId));

    if (shouldAutoReply) {
      const delay = 700 + Math.round(Math.random() * 800);
      replyTimerRef.current = setTimeout(() => {
        const reply = sellerReplies[Math.floor(Math.random() * sellerReplies.length)];
        sendMessage(conversationId, "seller", reply);
        setMessages(getMessages(conversationId));
      }, delay);
    }
  }

  if (conversation && !listing && isLoadingListing) {
    return (
      <section className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <h1 className="text-2xl font-semibold text-ink">Загружаем диалог</h1>
        <p className="mt-2 text-ink/58">Подтягиваем объявление из Choi.</p>
      </section>
    );
  }

  if (!conversation || !listing) {
    return (
      <section className="rounded-[24px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <h1 className="text-2xl font-semibold text-ink">Диалог не найден</h1>
        <p className="mt-2 text-ink/58">Откройте объявление и напишите продавцу ещё раз.</p>
        <Link
          href="/"
          className="focus-ring mt-6 inline-flex h-12 items-center rounded-full bg-leaf px-6 text-sm font-semibold text-white"
        >
          Смотреть объявления
        </Link>
      </section>
    );
  }

  const title = listing.titleRu ?? listing.title;

  return (
    <section className="flex min-h-[calc(100vh-9rem)] overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_rgba(24,32,29,0.08)] lg:min-h-[720px]">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-ink/8 bg-white p-4">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink lg:hidden"
              aria-label="Назад к сообщениям"
            >
              <ArrowLeft size={19} />
            </Link>
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-mist">
              <Image
                src={listing.image}
                alt={title}
                fill
                unoptimized={listing.image.startsWith("data:")}
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{conversation.sellerName}</p>
              <TrustBadge confirmedDealsCount={confirmedDealsCount} compact />
              <p className="truncate text-sm text-ink/52">{title}</p>
            </div>
          </div>
          <div className="mt-3">
            <ListingChatCard listing={listing} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#f7f5ef] p-4">
          <div className="space-y-3">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            ) : (
              <div className="mx-auto mt-12 max-w-sm rounded-[24px] bg-white p-6 text-center shadow-sm">
                <p className="font-semibold text-ink">Начните разговор</p>
                <p className="mt-2 text-sm text-ink/58">
                  Спросите, актуально ли объявление, или договоритесь о встрече.
                </p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <MessageComposer onSend={handleSend} />
      </div>
    </section>
  );
}
