"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Handshake, PackageCheck, X, XCircle } from "lucide-react";
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
  acceptReservationRequest,
  declineReservationRequest,
  getConfirmedDealForConversation,
  getLatestDealForConversation,
  getPendingDealForConversation,
  getLatestReservationForConversation,
  releaseExpiredReservations,
  requestReservationFromConversation,
  reserveListingForBuyer,
  respondToDeal,
  type RemoteDealRow,
  type ReservationRequestRow
} from "@/lib/data/deals";
import { ChoiTeaLoader } from "@/components/ChoiTeaLoader";
import {
  NOTIFICATION_EVENT,
  markConversationMessageNotificationsRead
} from "@/lib/data/notifications";
import { getReviewByDealAndReviewer, type DealReviewRow } from "@/lib/data/reviews";
import { createClient } from "@/utils/supabase/client";
import { DealReviewForm } from "@/components/reviews/DealReviewForm";
import { serializeMessageContent, type ChatAttachment } from "@/lib/chat/attachments";
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

function toDatetimeLocalValue(date = new Date(Date.now() + 60 * 60 * 1000)) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 16);
}

function formatReservationTime(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

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
  const [terminalDeal, setTerminalDeal] = useState<RemoteDealRow | null>(null);
  const [reservation, setReservation] = useState<ReservationRequestRow | null>(null);
  const [reservationTime, setReservationTime] = useState(() => toDatetimeLocalValue());
  const [reservationNote, setReservationNote] = useState("");
  const [reservationStatusText, setReservationStatusText] = useState("");
  const [reservationError, setReservationError] = useState("");
  const [isReservationBusy, setIsReservationBusy] = useState(false);
  const [reservationEditorOpen, setReservationEditorOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<DealReviewRow | null>(null);
  const [dismissedReviewDealId, setDismissedReviewDealId] = useState<string | null>(null);
  const [dealStatusText, setDealStatusText] = useState("");
  const [dealError, setDealError] = useState("");
  const [isDealBusy, setIsDealBusy] = useState(false);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

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
    const channels: RealtimeChannel[] = [];
    let refreshRemoteChat: (() => void) | undefined;

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
      await releaseExpiredReservations(supabase);
      await markMessagesRead(supabase, conversationId, userId);
      await markConversationMessageNotificationsRead(supabase, userId, conversationId);

      async function syncRemoteChat() {
        await releaseExpiredReservations(supabase);
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
        const latestDeal = await getLatestDealForConversation(
          supabase,
          mappedConversation.listingId,
          mappedConversation.buyerId,
          mappedConversation.sellerId
        );
        if (mounted) {
          setPendingDeal(activeDeal);
          setConfirmedDeal(completedDeal);
          setTerminalDeal(
            latestDeal && (latestDeal.status === "confirmed" || latestDeal.status === "cancelled")
              ? latestDeal
              : null
          );
        }

        const latestReservation = await getLatestReservationForConversation(
          supabase,
          conversationId
        );

        if (mounted) {
          setReservation(latestReservation);
          if (latestReservation?.status === "accepted") {
            setListing((current) => current ? { ...current, status: "reserved" } : current);
          }
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
      refreshRemoteChat = () => {
        void syncRemoteChat();
      };
      window.addEventListener(NOTIFICATION_EVENT, refreshRemoteChat);

      channels.push(
        supabase
          .channel(`chat-window:${conversationId}:${userId}:messages`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "messages",
              filter: `conversation_id=eq.${conversationId}`
            },
            refreshRemoteChat
          )
          .subscribe()
      );

      channels.push(
        supabase
          .channel(`chat-window:${conversationId}:${userId}:reservations`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "reservation_requests",
              filter: `conversation_id=eq.${conversationId}`
            },
            refreshRemoteChat
          )
          .subscribe()
      );

      channels.push(
        supabase
          .channel(`chat-window:${conversationId}:${userId}:deals`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "deals"
            },
            refreshRemoteChat
          )
          .subscribe()
      );
    }

    void syncRemoteListing();

    return () => {
      mounted = false;
      if (refreshRemoteChat) {
        window.removeEventListener(NOTIFICATION_EVENT, refreshRemoteChat);
      }
      channels.forEach((channel) => {
        void createClient().removeChannel(channel);
      });
    };
  }, [conversationId]);

  useEffect(() => {
    const container = messagesScrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }, [messages.length]);

  function handleSend(text: string, attachments: ChatAttachment[] = []) {
    const messageText = serializeMessageContent(text, attachments);

    if (conversation?.remote && currentUserId) {
      if (!messageText) {
        return;
      }

      const supabase = createClient();
      void sendRemoteMessage(supabase, conversationId, currentUserId, messageText).then(
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

    sendMessage(conversationId, "buyer", messageText);
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

  function getReservationIso() {
    const selectedDate = new Date(reservationTime);

    if (Number.isNaN(selectedDate.getTime())) {
      return null;
    }

    return selectedDate.toISOString();
  }

  async function handleRequestReservation() {
    if (!conversation?.remote || isReservationBusy) {
      return;
    }

    if (!reservationEditorOpen) {
      setReservationEditorOpen(true);
      return;
    }

    const requestedFor = getReservationIso();
    if (!requestedFor) {
      setReservationError("Выберите время встречи.");
      return;
    }

    setIsReservationBusy(true);
    setReservationError("");
    setReservationStatusText("");

    const supabase = createClient();
    const { reservation: nextReservation, error } = await requestReservationFromConversation(
      supabase,
      conversation.id,
      requestedFor,
      reservationNote
    );

    if (error || !nextReservation) {
      setReservationError("Не удалось предложить время. Проверьте время и попробуйте ещё раз.");
    } else {
      setReservation(nextReservation);
      setReservationEditorOpen(false);
      setReservationStatusText("Время встречи отправлено продавцу.");
    }

    setIsReservationBusy(false);
  }

  async function handleAcceptReservation() {
    if (!reservation || isReservationBusy) {
      return;
    }

    setIsReservationBusy(true);
    setReservationError("");
    setReservationStatusText("");

    const supabase = createClient();
    const { reservation: nextReservation, error } = await acceptReservationRequest(
      supabase,
      reservation.id
    );

    if (error || !nextReservation) {
      setReservationError("Не удалось подтвердить время. Попробуйте ещё раз.");
    } else {
      setReservation(nextReservation);
      setListing((current) => current ? { ...current, status: "reserved" } : current);
      setReservationStatusText("Время подтверждено. Объявление отмечено как забронированное.");
    }

    setIsReservationBusy(false);
  }

  async function handleDeclineReservation() {
    if (!reservation || isReservationBusy) {
      return;
    }

    setIsReservationBusy(true);
    setReservationError("");
    setReservationStatusText("");

    const supabase = createClient();
    const { reservation: nextReservation, error } = await declineReservationRequest(
      supabase,
      reservation.id
    );

    if (error || !nextReservation) {
      setReservationError("Не удалось отклонить время. Попробуйте ещё раз.");
    } else {
      setReservation(nextReservation);
      setReservationStatusText("Время отклонено.");
    }

    setIsReservationBusy(false);
  }

  async function handleSellerReserveForBuyer() {
    if (!conversation?.remote || isReservationBusy) {
      return;
    }

    if (!reservationEditorOpen) {
      setReservationEditorOpen(true);
      return;
    }

    const requestedFor = getReservationIso();
    if (!requestedFor) {
      setReservationError("Выберите время встречи.");
      return;
    }

    setIsReservationBusy(true);
    setReservationError("");
    setReservationStatusText("");

    const supabase = createClient();
    const { reservation: nextReservation, error } = await reserveListingForBuyer(
      supabase,
      conversation.id,
      requestedFor,
      reservationNote
    );

    if (error || !nextReservation) {
      setReservationError("Не удалось предложить время покупателю.");
    } else {
      setReservation(nextReservation);
      setReservationEditorOpen(false);
      setReservationStatusText("Время отправлено покупателю. Ждём подтверждения.");
    }

    setIsReservationBusy(false);
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
      setTerminalDeal(deal);
      setListing((current) =>
        current ? { ...current, status: confirmed ? "archived" : "active" } : current
      );
      setDealStatusText(
        confirmed ? "Сделка подтверждена. Спасибо!" : "Сделка отменена."
      );
    }

    setIsDealBusy(false);
  }

  if (isLoadingListing && (!conversation || !listing)) {
    return (
      <>
        <ChoiTeaLoader label="Загружаем диалог" />
        <section className="hidden">
        <h1 className="text-2xl font-semibold text-ink">Загружаем диалог</h1>
        <p className="mt-2 text-ink/58">Подтягиваем объявление из Choi.</p>
        </section>
      </>
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

  const isRemoteChat = Boolean(conversation.remote);
  const isSeller = isRemoteChat && currentUserId === conversation.sellerId;
  const isBuyer = isRemoteChat && currentUserId === conversation.buyerId;
  const listingStatus = listing.status ?? "active";
  const dealIsClosed = terminalDeal?.status === "confirmed" || terminalDeal?.status === "cancelled";
  const pendingReservation = reservation?.status === "pending" ? reservation : null;
  const acceptedReservation = reservation?.status === "accepted" ? reservation : null;
  const reservationIsActive =
    Boolean(acceptedReservation) &&
    new Date(acceptedReservation?.expires_at ?? 0).getTime() > Date.now();
  const canRequestReservation =
    isBuyer && !pendingReservation && !reservationIsActive && !dealIsClosed;
  const canAnswerReservation = Boolean(
    pendingReservation &&
      currentUserId &&
      pendingReservation.requested_by !== currentUserId &&
      (isSeller || isBuyer) &&
      !dealIsClosed
  );
  const canSellerReserveForBuyer =
    isSeller && !pendingReservation && !reservationIsActive && !dealIsClosed;
  const canOpenReservationEditor =
    !acceptedReservation &&
    !pendingReservation &&
    (canRequestReservation || canSellerReserveForBuyer);
  const showReservationEditor = reservationEditorOpen && canOpenReservationEditor;
  const visibleReservationNote =
    (acceptedReservation?.note ?? pendingReservation?.note ?? "").trim();
  const canCreateDeal =
    isSeller &&
    !pendingDeal &&
    !confirmedDeal &&
    !dealIsClosed &&
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
  const reviewModalOpen = Boolean(
    canReviewDeal &&
      confirmedDeal &&
      reviewedUserId &&
      dismissedReviewDealId !== confirmedDeal.id
  );

  return (
    <section className="flex h-[100dvh] min-h-[100dvh] overflow-hidden rounded-none bg-white shadow-none md:h-[calc(100dvh-10rem)] md:min-h-[560px] md:rounded-[24px] md:shadow-[0_18px_60px_rgba(24,32,29,0.08)] lg:h-[calc(100dvh-7.5rem)] lg:min-h-[680px]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="max-h-[42dvh] shrink-0 overflow-y-auto border-b border-ink/8 bg-white p-3 md:max-h-[42dvh]">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ink lg:hidden"
              aria-label="Назад к сообщениям"
            >
              <ArrowLeft size={19} />
            </Link>
            <Link
              href={`/profile/${conversation.sellerId}`}
              className="focus-ring min-w-0 rounded-2xl px-2 py-1 transition hover:bg-mist"
              title="Открыть профиль продавца"
            >
              <p className="truncate font-semibold text-ink">{conversation.sellerName}</p>
            </Link>
          </div>

          <div className="mt-2">
            <ListingChatCard listing={listing} />
          </div>

          {(isSeller ||
            isBuyer ||
            canRespondToDeal ||
            terminalDeal ||
            dealStatusText ||
            dealError ||
            reservationStatusText ||
            reservationError ||
            reservation) && (
            <div className="mt-2 rounded-[20px] border border-ink/10 bg-mist/70 p-2">
              {isRemoteChat && !dealIsClosed ? (
                <div className="mb-2 rounded-2xl bg-white p-2">
                  <div className="flex items-start gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf/10 text-leaf">
                      <CalendarClock size={16} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      {(acceptedReservation || pendingReservation || showReservationEditor) ? (
                        <p className="text-sm font-semibold text-ink">
                          {acceptedReservation ? "Назначена встреча" : "Встреча на время"}
                        </p>
                      ) : null}
                      {acceptedReservation ? (
                        <p className="mt-0.5 text-xs text-ink/62">
                          Забронировано до {formatReservationTime(acceptedReservation.expires_at)}.
                        </p>
                      ) : pendingReservation ? (
                        <p className="mt-0.5 text-xs text-ink/62">
                          {pendingReservation.requested_by === currentUserId
                            ? "Вы предложили время"
                            : isBuyer
                              ? "Продавец назначил время"
                              : "Покупатель предложил время"}
                          : {formatReservationTime(pendingReservation.requested_for)}.
                          {pendingReservation.requested_by === currentUserId
                            ? " Ждём подтверждения."
                            : " Подтвердите, подходит ли оно вам."}
                        </p>
                      ) : showReservationEditor ? (
                        <p className="mt-0.5 text-xs text-ink/62">
                          Выберите время встречи. Если встреча не подтвердится сделкой, бронь автоматически спадёт через 30 минут после этого времени.
                        </p>
                      ) : null}
                      {visibleReservationNote ? (
                        <p className="mt-1 rounded-2xl bg-mist px-3 py-2 text-xs font-medium text-ink/70">
                          Комментарий: {visibleReservationNote}
                        </p>
                      ) : null}

                      <div className="order-1 flex flex-wrap gap-2">
                        {canRequestReservation ? (
                          <button
                            type="button"
                            onClick={handleRequestReservation}
                            disabled={isReservationBusy}
                            className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-leaf/20 bg-white px-3 text-sm font-semibold text-leaf shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45"
                          >
                            <CalendarClock size={17} />
                            Предложить время
                          </button>
                        ) : null}
                        {canAnswerReservation ? (
                          <>
                            <button
                              type="button"
                              onClick={handleAcceptReservation}
                              disabled={isReservationBusy}
                              className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-leaf px-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45"
                            >
                              <CheckCircle2 size={17} />
                              Подтвердить время
                            </button>
                            <button
                              type="button"
                              onClick={handleDeclineReservation}
                              disabled={isReservationBusy}
                              className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-ink/10 bg-white px-3 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45"
                            >
                              <XCircle size={17} />
                              Не подходит
                            </button>
                          </>
                        ) : null}
                        {canSellerReserveForBuyer ? (
                          <button
                            type="button"
                            onClick={handleSellerReserveForBuyer}
                            disabled={isReservationBusy}
                            className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-leaf/20 bg-white px-3 text-sm font-semibold text-leaf shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45"
                          >
                            <PackageCheck size={17} />
                            Предложить время
                          </button>
                        ) : null}
                      </div>

                      {!acceptedReservation && !pendingReservation && showReservationEditor ? (
                        <div className="order-2 mt-2 grid gap-2 sm:grid-cols-[220px_1fr]">
                          <input
                            type="datetime-local"
                            value={reservationTime}
                            min={toDatetimeLocalValue(new Date(Date.now() + 5 * 60 * 1000))}
                            onChange={(event) => setReservationTime(event.target.value)}
                            className="focus-ring h-10 rounded-2xl border border-ink/10 bg-mist px-3 text-sm font-semibold text-ink"
                          />
                          <input
                            value={reservationNote}
                            maxLength={120}
                            onChange={(event) => setReservationNote(event.target.value)}
                            placeholder="Комментарий, например: возле метро"
                            className="focus-ring h-10 rounded-2xl border border-ink/10 bg-mist px-3 text-sm font-medium text-ink placeholder:text-ink/40"
                          />
                        </div>
                      ) : null}

                      {reservationStatusText ? (
                        <p className="mt-1 text-xs font-semibold text-leaf">
                          {reservationStatusText}
                        </p>
                      ) : null}
                      {reservationError ? (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {reservationError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {terminalDeal ? (
                <div className="mb-2 rounded-2xl bg-white p-2">
                  <p className="text-sm font-semibold text-ink">
                    {terminalDeal.status === "confirmed"
                      ? "Сделка в истории: совершилась"
                      : "Сделка в истории: сорвалась"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/58">
                    Завершённую сделку нельзя вернуть или изменить. Для новой договорённости нужен новый сценарий.
                  </p>
                </div>
              ) : null}
              {isSeller && !dealIsClosed && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCreateDeal}
                    disabled={!canCreateDeal || isDealBusy}
                    className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-leaf px-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45"
                  >
                    <Handshake size={17} />
                    Отправить сделку
                  </button>
                </div>
              )}

              {canRespondToDeal && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Продавец отметил сделку
                    </p>
                    <p className="text-xs text-ink/58">
                      Подтвердите, состоялась ли встреча и покупка.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespondToDeal(true)}
                      disabled={isDealBusy}
                      className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-leaf px-3 text-sm font-semibold text-white shadow-sm disabled:pointer-events-none disabled:opacity-45"
                    >
                      <CheckCircle2 size={17} />
                      Подтвердить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespondToDeal(false)}
                      disabled={isDealBusy}
                      className="focus-ring inline-flex h-9 items-center gap-2 rounded-full border border-ink/10 bg-white px-3 text-sm font-semibold text-ink shadow-sm disabled:pointer-events-none disabled:opacity-45"
                    >
                      <XCircle size={17} />
                      Не состоялась
                    </button>
                  </div>
                </div>
              )}

              {dealStatusText && (
                <p className="mt-1 text-xs font-semibold text-leaf">{dealStatusText}</p>
              )}
              {dealError && (
                <p className="mt-1 text-xs font-semibold text-red-600">{dealError}</p>
              )}
            </div>
          )}

          {reviewModalOpen && confirmedDeal && reviewedUserId ? (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 backdrop-blur-sm sm:items-center">
              <div className="relative max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-4 shadow-[0_24px_80px_rgba(24,32,29,0.24)] sm:p-5">
                <button
                  type="button"
                  onClick={() => setDismissedReviewDealId(confirmedDeal.id)}
                  className="focus-ring absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-mist text-ink transition hover:bg-leaf/10 hover:text-leaf"
                  aria-label="Закрыть отзыв"
                >
                  <X size={20} />
                </button>
                <DealReviewForm
                  dealId={confirmedDeal.id}
                  reviewedUserId={reviewedUserId}
                  reviewedUserName={reviewedUserName || "участником сделки"}
                  onSubmitted={() => {
                    window.setTimeout(() => {
                      setCurrentReview({
                        id: "submitted",
                        deal_id: confirmedDeal.id,
                        reviewer_id: currentUserId,
                        reviewed_user_id: reviewedUserId,
                        rating_type: "positive",
                        comment: null,
                        created_at: new Date().toISOString()
                      });
                      setDismissedReviewDealId(confirmedDeal.id);
                    }, 900);
                  }}
                />
              </div>
            </div>
          ) : null}
        </header>

        <div ref={messagesScrollRef} className="min-h-0 flex-1 overflow-y-auto bg-[#f7f5ef] p-4">
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
          </div>
        </div>

        <MessageComposer onSend={handleSend} />
      </div>
    </section>
  );
}

