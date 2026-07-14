import {
  Bell,
  CheckCircle2,
  HandCoins,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Tag,
  XCircle,
  type LucideIcon
} from "lucide-react";
import type { NotificationRow, NotificationType } from "@/lib/data/notifications";

export function getNotificationIcon(type: NotificationType): LucideIcon {
  if (type === "message") return MessageCircle;
  if (type === "deal_confirmation") return HandCoins;
  if (type === "deal_confirmed") return CheckCircle2;
  if (type === "deal_cancelled") return XCircle;
  if (type === "trust_level") return ShieldCheck;
  if (type === "offer_received") return Tag;
  if (type === "offer_accepted") return CheckCircle2;
  if (type === "offer_declined") return XCircle;
  if (type === "listing_reserved") return PackageCheck;
  if (type === "system") return Sparkles;
  return Bell;
}

export function getNotificationHref(notification: NotificationRow) {
  if (notification.type === "message" && notification.conversation_id) {
    return `/chat/${notification.conversation_id}`;
  }

  if (
    (notification.type === "offer_received" ||
      notification.type === "offer_accepted" ||
      notification.type === "offer_declined") &&
    notification.conversation_id
  ) {
    return `/chat/${notification.conversation_id}`;
  }

  if (
    notification.type === "deal_confirmation" &&
    (notification.conversation_id || notification.deal_id)
  ) {
    return notification.conversation_id
      ? `/chat/${notification.conversation_id}`
      : "/notifications";
  }

  if (notification.type === "trust_level") {
    return "/profile";
  }

  if (notification.type === "listing_reserved" && notification.listing_id) {
    return `/listing/${notification.listing_id}`;
  }

  return "";
}

export function formatNotificationTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Только что";
  if (diffMinutes < 60) return `${diffMinutes} минут назад`;

  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return `Сегодня, ${new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Вчера, ${new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)}`;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(date);
}

export function getNotificationGroup(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Сегодня";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Вчера";

  return "Ранее";
}
