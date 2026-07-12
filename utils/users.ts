import { getStoredListings } from "@/utils/listings";
import type { AddressMode } from "@/utils/trust";

export const CURRENT_USER_KEY = "choi_current_user";
export const USER_EVENT = "choi:user-changed";
export const CURRENT_USER_ID = "current-user";

export type ChoiUser = {
  id: string;
  name: string;
  city: string;
  district: string;
  avatar?: string;
  joinedAt: number;
  phoneVerified: boolean;
  successfulDeals: number;
  complaints: number;
  addressMode: AddressMode;
};

export const defaultCurrentUser: ChoiUser = {
  id: CURRENT_USER_ID,
  name: "Макс",
  city: "Ташкент",
  district: "yunusabad",
  joinedAt: 2026,
  phoneVerified: true,
  successfulDeals: 7,
  complaints: 0,
  addressMode: "aka"
};

export const publicUsers: ChoiUser[] = [
  {
    id: "seller-akmal",
    name: "Akmal",
    city: "Ташкент",
    district: "yunusabad",
    joinedAt: 2026,
    phoneVerified: true,
    successfulDeals: 18,
    complaints: 0,
    addressMode: "aka"
  },
  {
    id: "seller-madina",
    name: "Madina",
    city: "Ташкент",
    district: "chilanzar",
    joinedAt: 2026,
    phoneVerified: true,
    successfulDeals: 8,
    complaints: 0,
    addressMode: "opa"
  },
  {
    id: "seller-bekzod",
    name: "Bekzod",
    city: "Ташкент",
    district: "mirabad",
    joinedAt: 2026,
    phoneVerified: true,
    successfulDeals: 6,
    complaints: 0,
    addressMode: "aka"
  },
  {
    id: "seller-nilufar",
    name: "Nilufar",
    city: "Ташкент",
    district: "yakkasaray",
    joinedAt: 2026,
    phoneVerified: true,
    successfulDeals: 5,
    complaints: 0,
    addressMode: "opa"
  },
  {
    id: "seller-oybek",
    name: "Oybek",
    city: "Ташкент",
    district: "shaykhantakhur",
    joinedAt: 2026,
    phoneVerified: true,
    successfulDeals: 2,
    complaints: 0,
    addressMode: "aka"
  },
  {
    id: "seller-sardor",
    name: "Sardor",
    city: "Ташкент",
    district: "almazar",
    joinedAt: 2026,
    phoneVerified: true,
    successfulDeals: 34,
    complaints: 0,
    addressMode: "aka"
  }
];

function notifyUserChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USER_EVENT));
  }
}

export function getCurrentUser(): ChoiUser {
  if (typeof window === "undefined") {
    return defaultCurrentUser;
  }

  try {
    const rawUser = window.localStorage.getItem(CURRENT_USER_KEY);
    if (!rawUser) {
      window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultCurrentUser));
      return defaultCurrentUser;
    }

    return { ...defaultCurrentUser, ...JSON.parse(rawUser), id: CURRENT_USER_ID };
  } catch {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultCurrentUser));
    return defaultCurrentUser;
  }
}

export function updateCurrentUser(input: Pick<ChoiUser, "name" | "district" | "addressMode">) {
  const nextUser = { ...getCurrentUser(), ...input };
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(nextUser));
  notifyUserChanged();
  return nextUser;
}

export function getUserById(userId: string): ChoiUser | undefined {
  if (userId === CURRENT_USER_ID) {
    return getCurrentUser();
  }

  return publicUsers.find((user) => user.id === userId);
}

export function getCurrentUserListingsCount() {
  return getStoredListings().filter((listing) => listing.sellerId === CURRENT_USER_ID).length;
}
