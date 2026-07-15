"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Handshake, PackageCheck, XCircle } from "lucide-react";
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
  markMessagesRead,
  mapMessageRow,
  sendMessage as sendRemoteMessage
} from "@/lib/data/messages";
import {
  createDealFromConversation,
  getConfirmedDealForConversation,
  getPendingDealForConversation,
  reserveListingFromConversation,
  respondToDeal,
  type RemoteDealRow
} from "@/lib/data/deals";
import { markConversationMessageNotificationsRead } from "@/lib/data/notifications";
import { getReviewByDealAndReviewer, type DealReviewRow } from "@/lib/data/reviews";
import { createClient } from "@/utils/supabase/client";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { DealReviewForm } from "@/components/reviews/DealReviewForm";
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
  const [pendingDeal, setPendingDeal] = useState<RemoteDealRow | null>(null);
  const [confirmedDeal, setConfirmedDeal] = useState<RemoteDealRow | null>(null);
  const [currentReview, setCurrentReview] = useState<DealReviewRow | null>(null);
  const [dealStatusText, setDealStatusText] = useState("");
  const [dealError, setDealError] = useState("");
  const [isDealBusy, setIsDealBusy] = useState(false);
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
      await markMessagesRead(supabase, conversationId, userId);
      await markConversationMessageNotificationsRead(supabase, userId, conversationId);

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

        const activeDeal = await getPendingDealForConversation(
          supabase,
          mappedConversation.listingId,
          mappedConversation.buyerId,
          mappedConversation.sellerId
        );
        const completedDeal = await getConfirmedDealForConversation(
          supabase,
          mappedConversation.listingId,
          mappedConversation.buyerId,
          mappedConversation.sellerId
        );
        if (mounted) {
          setPendingDeal(activeDeal);
          setConfirmedDeal(completedDeal);
        }

        if (completedDeal) {
          const review = await getReviewByDealAndReviewer(supabase, completedDeal.id, userId);
          if (mounted) {
            setCurrentReview(review);
          }
        } else if (mounted) {
          setCurrentReview(null);
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

  async function handleReserveListing() {
    if (!conversation?.remote || isDealBusy) {
      return;
    }

    setIsDealBusy(true);
    setDealError("");
    setDealStatusText("");

    const supabase = createClient();
    const { error } = await reserveListingFromConversation(supabase, conversation.id);

    if (error) {
      setDealError("Не удалось забронировать объявление. Попробуйте ещё раз.");
    } else {
      setListing((current) => current ? { ...current, status: "reserved" } : current);
      setDealStatusText("Объявление забронировано для покупателя.");
    }

    setIsDealBusy(false);
  }

  async function handleCreateDeal() {
    if (!conversation?.remote || isDealBusy) {
      return;
    }

    setIsDealBusy(true);
    setDealError("");
    setDealStatusText("");

    const supabase = createClient();
    const { deal, error } = await createDealFromConversation(supabase, conversation.id);

    if (error || !deal) {
      setDealError("Не удалось отправить подтверждение сделки.");
    } else {
      setPendingDeal(deal);
      setListing((current) => current ? { ...current, status: "reserved" } : current);
      setDealStatusText("Покупателю отправлено подтверждение сделки.");
    }

    setIsDealBusy(false);
  }

  async function handleRespondToDeal(confirmed: boolean) {
    if (!pendingDeal || isDealBusy) {
      return;
    }

    setIsDealBusy(true);
    setDealError("");
    setDealStatusText("");

    const supabase = createClient();
    const { deal, error } = await respondToDeal(supabase, pendingDeal.id, confirmed);

    if (error || !deal) {
      setDealError("Не удалось отправить ответ по сделке.");
    } else {
      setPendingDeal(null);
      setConfirmedDeal(confirmed ? deal : null);
      setListing((current) =>
        current ? { ...current, status: confirmed ? "sold" : "active" } : current
      );
      setDealStatusText(
        confirmed ? "Сделка подтверждена. Спасибо!" : "Сделка отменена."
      );
    }

    setIsDealBusy(false);
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
        <p className="mt-2 text-ink/58">
          Откройте объявление и напишите продавцу ещё раз.
        </p>
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
  const isRemoteChat = Boolean(conversation.remote);
  const isSeller = isRemoteChat && currentUserId === conversation.sellerId;
  const isBuyer = isRemoteChat && currentUserId === conversation.buyerId;
  const listingStatus = listing.status ?? "active";
  const canReserveListing = isSeller && listingStatus === "active";
  const canCreateDeal =
    isSeller &&
    !pendingDeal &&
    !confirmedDeal &&
    (listingStatus === "active" || listingStatus === "reserved");
  const canRespondToDeal = isBuyer && pendingDeal?.status === "pending";
  const reviewedUserId = isSeller ? conversation.buyerId : conversation.sellerId;
  const reviewedUserName = isSeller ? conversation.buyerName : conversation.sellerName;
  const canReviewDeal = Boolean(
    confirmedDeal &&
      reviewedUserId &&
      currentUserId &&
      reviewedUserId !== currentUserId &&
      !currentReview
  );

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

          {(isSeller || canRespondToDeal || dealStatusText || dealError) && (
            <div className="mt-3 rounded-[20px] border border-ink/10 bg-mist/70 p-3">
              {isSeller && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleReserveListing}
                    disabled={!canReserveListing || isDealBusy}
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-leaf/20 bg-white px-4 text-sm font-semibold text-leaf shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45"
                  >
                    <PackageCheck size={17} />
                    Забронировать
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateDeal}
                    disabled={!canCreateDeal || isDealBusy}
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45"
                  >
                    <Handshake size={17} />
                    Отправить сделку
                  </button>
                </div>
              )}

              {canRespondToDeal && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Продавец отметил сделку
                    </p>
                    <p className="text-sm text-ink/58">
                      Подтвердите, состоялась ли встреча и покупка.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespondToDeal(true)}
                      disabled={isDealBusy}
                      className="focus-ring inline-flex h-10 items-center gap-2 rounded-full bg-leaf px-4 text-sm font-semibold text-white shadow-sm disabled:pointer-events-none disabled:opacity-45"
                    >
                      <CheckCircle2 size={17} />
                      Подтвердить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespondToDeal(false)}
                      disabled={isDealBusy}
                      className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm disabled:pointer-events-none disabled:opacity-45"
                    >
                      <XCircle size={17} />
                      Не состоялась
                    </button>
                  </div>
                </div>
              )}

              {dealStatusText && (
                <p className="mt-2 text-sm font-semibold text-leaf">{dealStatusText}</p>
              )}
              {dealError && (
                <p className="mt-2 text-sm font-semibold text-red-600">{dealError}</p>
              )}
            </div>
          )}

          {canReviewDeal && confirmedDeal && reviewedUserId ? (
            <div className="mt-3">
              <DealReviewForm
                dealId={confirmedDeal.id}
                reviewedUserId={reviewedUserId}
                reviewedUserName={reviewedUserName || "участником сделки"}
                onSubmitted={() => {
                  setCurrentReview({
                    id: "submitted",
                    deal_id: confirmedDeal.id,
                    reviewer_id: currentUserId,
                    reviewed_user_id: reviewedUserId,
                    rating_type: "positive",
                    comment: null,
                    created_at: new Date().toISOString()
                  });
                }}
              />
            </div>
          ) : null}
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
