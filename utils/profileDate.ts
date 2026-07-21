import type { ChoiUser } from "@/utils/users";

const monthNames = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря"
];

function getJoinedDate(user: Pick<ChoiUser, "joinedAt" | "joinedAtDate">) {
  if (user.joinedAtDate) {
    const date = new Date(user.joinedAtDate);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date(user.joinedAt, 0, 1);
}

export function formatJoinedDate(user: Pick<ChoiUser, "joinedAt" | "joinedAtDate">) {
  const date = getJoinedDate(user);

  return `На Choi с ${monthNames[date.getMonth()]} ${date.getFullYear()} года`;
}

export function getAccountAgeMonths(user: Pick<ChoiUser, "joinedAt" | "joinedAtDate">) {
  const joinedDate = getJoinedDate(user);
  const now = new Date();

  return Math.max(
    0,
    (now.getFullYear() - joinedDate.getFullYear()) * 12 +
      now.getMonth() -
      joinedDate.getMonth()
  );
}
