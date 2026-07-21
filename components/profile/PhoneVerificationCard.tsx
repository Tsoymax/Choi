"use client";

import Image from "next/image";
import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import type { ChoiUser } from "@/utils/users";
import { createClient } from "@/utils/supabase/client";
import {
  profileToChoiUser,
  setCurrentProfilePhoneVerification
} from "@/lib/data/profiles";

type PhoneVerificationCardProps = {
  user: ChoiUser;
  onVerified: (user: ChoiUser) => void;
};

function normalizePhone(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (cleaned.startsWith("998")) {
    return `+${cleaned}`;
  }

  return cleaned;
}

export function PhoneVerificationCard({ user, onVerified }: PhoneVerificationCardProps) {
  const [phone, setPhone] = useState(user.phone ?? "+998");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">(user.phone ? "code" : "phone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function sendCode() {
    setError("");
    setMessage("");

    const normalizedPhone = normalizePhone(phone);

    if (!/^\+998\d{9}$/.test(normalizedPhone)) {
      setError("Введите номер в формате +998901234567.");
      return;
    }

    setIsBusy(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({
        phone: normalizedPhone
      });

      if (authError) {
        throw authError;
      }

      await setCurrentProfilePhoneVerification(normalizedPhone, false);
      setPhone(normalizedPhone);
      setStep("code");
      setMessage("Мы отправили SMS-код. Введите его ниже.");
    } catch {
      setError(
        "Не удалось отправить SMS. Проверьте номер или включите Phone/SMS provider в Supabase."
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function verifyCode() {
    setError("");
    setMessage("");

    const normalizedPhone = normalizePhone(phone);

    if (code.trim().length < 4) {
      setError("Введите код из SMS.");
      return;
    }

    setIsBusy(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code.trim(),
        type: "phone_change"
      });

      if (verifyError) {
        throw verifyError;
      }

      const { profile, error: profileError } = await setCurrentProfilePhoneVerification(
        normalizedPhone,
        true
      );

      if (profileError || !profile) {
        throw profileError ?? new Error("Profile update failed");
      }

      onVerified(profileToChoiUser(profile));
      setMessage("Телефон подтверждён. Чайничек доверия добавлен к профилю.");
    } catch {
      setError("Не удалось подтвердить код. Проверьте SMS и попробуйте ещё раз.");
    } finally {
      setIsBusy(false);
    }
  }

  if (user.phoneVerified) {
    return (
      <section className="rounded-[24px] border border-leaf/10 bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist">
            <Image src="/images/choi-teapot.png" alt="" width={34} height={34} />
          </span>
          <div>
            <p className="font-semibold text-ink">Телефон подтверждён</p>
            <p className="mt-1 text-sm text-ink/60">
              Чайничек рядом с именем показывает, что номер прошёл проверку.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-leaf/10 bg-white p-5 shadow-[0_18px_60px_rgba(24,32,29,0.08)]">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist text-leaf">
          <ShieldCheck size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-ink">Подтвердите телефон</h2>
          <p className="mt-1 text-sm leading-6 text-ink/62">
            После проверки рядом с именем появится чайничек доверия.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Номер телефона</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isBusy}
                inputMode="tel"
                className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-semibold text-ink shadow-sm"
                placeholder="+998901234567"
              />
            </label>

            {step === "code" ? (
              <label className="block">
                <span className="text-sm font-semibold text-ink">Код из SMS</span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={isBusy}
                  inputMode="numeric"
                  className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-semibold text-ink shadow-sm"
                  placeholder="123456"
                />
              </label>
            ) : null}

            {message ? (
              <p className="rounded-2xl bg-mist px-4 py-3 text-sm font-semibold text-leaf">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl bg-[#fff2ef] px-4 py-3 text-sm font-semibold text-coral">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={sendCode}
                disabled={isBusy}
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border border-leaf/20 bg-mist px-5 text-sm font-semibold text-leaf transition hover:border-leaf/40 disabled:cursor-wait disabled:opacity-70"
              >
                <Send size={17} />
                {step === "code" ? "Отправить код ещё раз" : "Получить код"}
              </button>
              {step === "code" ? (
                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={isBusy}
                  className="focus-ring h-12 rounded-full bg-leaf px-5 text-sm font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70"
                >
                  Подтвердить
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
