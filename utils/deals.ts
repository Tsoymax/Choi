import type { Conversation } from "@/utils/chat";
import { getConversationsByListingId } from "@/utils/chat";
import type { Listing } from "@/utils/listings";
import { LISTINGS_EVENT, getStoredListings, updateStoredListingStatus } from "@/utils/listings";
import { CURRENT_USER_ID, getUserById } from "@/utils/users";
import { getTrustLevel } from "@/lib/trust/getTrustLevel";

export const DEALS_KEY = "choi_deals";
export const NOTIFICATIONS_KEY = "choi_notifications";
export const DEALS_EVENT = "choi:deals-changed";
export const NOTIFICATIONS_EVENT = "choi:notifications-changed";

export type DealStatus = "pending" | "confirmed" | "cancelled";
export type ChoiDeal = {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string | null;
  buyerName?: string;
  status: DealStatus;
  createdAt: string;
  confirmedAt?: string;
};

export type ChoiNotification = {
  id: string;
  userId: string;
  type: "deal_confirmation" | "message" | "system" | "trust_level";
  title: string;
  body?: string;
  listingId?: string;
  dealId?: string;
  isRead: boolean;
  createdAt: string;
};

export type DealInterlocutor = {
  id: string;
  displayName: string;
  district: string;
  conversationId: string;
};

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[], eventName: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}

export function getDeals() {
  return readArray<ChoiDeal>(DEALS_KEY);
}

export function getNotifications() {
  return readArray<ChoiNotification>(NOTIFICATIONS_KEY).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUnreadNotificationsCount(userId = CURRENT_USER_ID) {
  return getNotifications().filter(
    (notification) => notification.userId === userId && !notification.isRead
  ).length;
}

export function markNotificationRead(notificationId: string) {
  const nextNotifications = getNotifications().map((notification) =>
    notification.id === notificationId ? { ...notification, isRead: true } : notification
  );
  writeArray(NOTIFICATIONS_KEY, nextNotifications, NOTIFICATIONS_EVENT);
}

export function getDealInterlocutors(listingId: string): DealInterlocutor[] {
  const seen = new Set<string>();
  const conversations = getConversationsByListingId(listingId);

  return conversations.reduce<DealInterlocutor[]>((items, conversation: Conversation) => {
    const id = conversation.buyerId ?? `buyer-${conversation.id}`;
    if (seen.has(id)) return items;
    seen.add(id);

    const user = getUserById(id);
    items.push({
      id,
      displayName: user?.name ?? conversation.buyerName ?? "Покупатель Choi",
      district: user?.district ?? "yunusabad",
      conversationId: conversation.id
    });
    return items;
  }, []);
}

export function createDealForListing(listing: Listing, buyer?: DealInterlocutor | null) {
  const now = new Date().toISOString();
  const deals = getDeals();
  const previousCount = getConfirmedDealsCount(listing.sellerId ?? CURRENT_USER_ID);
  const status: DealStatus = buyer ? "pending" : "confirmed";
  const deal: ChoiDeal = {
    id: `deal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    listingId: listing.id,
    sellerId: listing.sellerId ?? CURRENT_USER_ID,
    buyerId: buyer?.id ?? null,
    buyerName: buyer?.displayName,
    status,
    createdAt: now,
    confirmedAt: status === "confirmed" ? now : undefined
  };

  writeArray(DEALS_KEY, [deal, ...deals], DEALS_EVENT);
  updateStoredListingStatus(listing.id, "archived");

  if (buyer) {
    const notifications = getNotifications();
    writeArray(
      NOTIFICATIONS_KEY,
      [
        {
          id: `notification-${Date.now()}`,
          userId: buyer.id,
          type: "deal_confirmation",
          title: "Сделка состоялась?",
          body: listing.titleRu ?? listing.title,
          listingId: listing.id,
          dealId: deal.id,
          isRead: false,
          createdAt: now
        },
        ...notifications
      ],
      NOTIFICATIONS_EVENT
    );
  } else {
    maybeCreateTrustLevelNotification(deal.sellerId, previousCount);
  }

  window.dispatchEvent(new Event(LISTINGS_EVENT));
  return deal;
}

export function respondToDeal(dealId: string, confirmed: boolean) {
  const now = new Date().toISOString();
  const deal = getDeals().find((item) => item.id === dealId);
  if (!deal || deal.status !== "pending") {
    return;
  }

  const previousSellerCount = getConfirmedDealsCount(deal.sellerId);
  const previousBuyerCount = deal.buyerId ? getConfirmedDealsCount(deal.buyerId) : 0;
  const nextDeals = getDeals().map((item) =>
    item.id === dealId
      ? {
          ...item,
          status: confirmed ? "confirmed" : "cancelled",
          confirmedAt: confirmed ? now : undefined
        }
      : item
  );

  writeArray(DEALS_KEY, nextDeals, DEALS_EVENT);

  if (confirmed) {
    maybeCreateTrustLevelNotification(deal.sellerId, previousSellerCount);
    if (deal.buyerId) {
      maybeCreateTrustLevelNotification(deal.buyerId, previousBuyerCount);
    }
  }
}

function maybeCreateTrustLevelNotification(userId: string, previousConfirmedCount: number) {
  const nextConfirmedCount = getConfirmedDealsCount(userId);
  const previousLevel = getTrustLevel(previousConfirmedCount);
  const nextLevel = getTrustLevel(nextConfirmedCount);

  if (previousLevel.key === nextLevel.key) {
    return;
  }

  writeArray(
    NOTIFICATIONS_KEY,
    [
      {
        id: `notification-trust-${Date.now()}-${userId}`,
        userId,
        type: "trust_level",
        title: `Новый уровень — ${nextLevel.name} ☕`,
        body: "Ваше доверие в Choi растёт. Спасибо, что торгуете рядом.",
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...getNotifications()
    ],
    NOTIFICATIONS_EVENT
  );
}

export function getConfirmedDealsCount(userId: string) {
  const localConfirmedDeals = getDeals().filter(
    (deal) =>
      deal.status === "confirmed" &&
      (deal.sellerId === userId || deal.buyerId === userId)
  ).length;
  const fallbackUser = getUserById(userId);

  return localConfirmedDeals + (fallbackUser?.successfulDeals ?? 0);
}

export function getOwnedListingById(listingId: string) {
  return getStoredListings().find(
    (listing) => listing.id === listingId && listing.sellerId === CURRENT_USER_ID
  );
}
