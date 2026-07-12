import type { Listing } from "@/utils/listings";

export const CONVERSATIONS_KEY = "choi_conversations";
export const MESSAGES_KEY = "choi_messages";
export const CHAT_EVENT = "choi:chat-changed";

export type Conversation = {
  id: string;
  listingId: string;
  sellerName: string;
  buyerName: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  sender: "buyer" | "seller";
  text: string;
  createdAt: string;
  read: boolean;
};

function notifyChatChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHAT_EVENT));
  }
}

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return [];
    }

    const value = JSON.parse(rawValue);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  notifyChatChanged();
}

export function getConversations(): Conversation[] {
  return readArray<Conversation>(CONVERSATIONS_KEY).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getConversationById(id: string) {
  return getConversations().find((conversation) => conversation.id === id);
}

export function getConversationByListingId(listingId: string) {
  return getConversations().find((conversation) => conversation.listingId === listingId);
}

export function createConversation(listing: Listing) {
  const existingConversation = getConversationByListingId(listing.id);
  if (existingConversation) {
    return existingConversation;
  }

  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: `conversation-${listing.id}-${Date.now()}`,
    listingId: listing.id,
    sellerName: listing.seller,
    buyerName: "Вы",
    createdAt: now,
    updatedAt: now
  };

  writeArray(CONVERSATIONS_KEY, [conversation, ...getConversations()]);
  return conversation;
}

export function getMessages(conversationId: string) {
  return readArray<Message>(MESSAGES_KEY)
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getLastMessage(conversationId: string) {
  return getMessages(conversationId).at(-1);
}

export function sendMessage(conversationId: string, sender: "buyer" | "seller", text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return undefined;
  }

  const now = new Date().toISOString();
  const message: Message = {
    id: `message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    conversationId,
    sender,
    text: trimmedText,
    createdAt: now,
    read: sender === "buyer"
  };

  const messages = readArray<Message>(MESSAGES_KEY);
  window.localStorage.setItem(MESSAGES_KEY, JSON.stringify([...messages, message]));

  const conversations = readArray<Conversation>(CONVERSATIONS_KEY);
  const nextConversations = conversations.map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, updatedAt: now }
      : conversation
  );
  window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(nextConversations));
  notifyChatChanged();

  return message;
}

export function markConversationRead(conversationId: string) {
  const messages = readArray<Message>(MESSAGES_KEY);
  const hasUnreadMessages = messages.some(
    (message) =>
      message.conversationId === conversationId &&
      message.sender === "seller" &&
      !message.read
  );

  if (!hasUnreadMessages) {
    return;
  }

  const nextMessages = messages.map((message) =>
    message.conversationId === conversationId ? { ...message, read: true } : message
  );
  writeArray(MESSAGES_KEY, nextMessages);
}

export function hasUnreadConversation(conversationId: string) {
  return getMessages(conversationId).some(
    (message) => message.sender === "seller" && !message.read
  );
}

export function getUnreadConversationCount() {
  return getConversations().filter((conversation) => hasUnreadConversation(conversation.id)).length;
}
