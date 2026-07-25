import { NextResponse, type NextRequest } from "next/server";

type BetaAccessRequest = {
  email?: string;
};

const CLOSED_BETA_MESSAGE =
  "Сейчас Choi работает в закрытой beta. Напишите нам, чтобы получить доступ.";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAllowedEmails() {
  const rawValue = process.env.CHOI_BETA_ALLOWED_EMAILS;

  if (!rawValue?.trim()) {
    return null;
  }

  const emails = rawValue
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);

  if (emails.includes("*")) {
    return null;
  }

  return new Set(emails);
}

export async function POST(request: NextRequest) {
  let payload: BetaAccessRequest;

  try {
    payload = (await request.json()) as BetaAccessRequest;
  } catch {
    return NextResponse.json(
      { allowed: false, message: "Введите корректный email." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(payload.email ?? "");

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { allowed: false, message: "Введите корректный email." },
      { status: 400 }
    );
  }

  const allowedEmails = getAllowedEmails();

  if (!allowedEmails || allowedEmails.has(email)) {
    return NextResponse.json({ allowed: true });
  }

  return NextResponse.json(
    { allowed: false, message: CLOSED_BETA_MESSAGE },
    { status: 403 }
  );
}
