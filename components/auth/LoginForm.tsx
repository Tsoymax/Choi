"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  ensureProfileForUser,
  getOnboardingPath,
  isProfileOnboardingComplete
} from "@/lib/data/profiles";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNext(searchParams.get("next"));
  const confirmationError = searchParams.get("error") === "email_confirmation_failed";
  const emailConfirmed = searchParams.get("confirmed") === "1";
  const registrationPending = searchParams.get("pending") === "1";
  const pendingEmail = searchParams.get("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.includes("@") || !password) {
      setError("Введите email и пароль.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (signInError) {
      setIsSubmitting(false);
      setError("Не удалось войти. Проверьте email и пароль.");
      return;
    }

    if (!data.user) {
      setIsSubmitting(false);
      setError("Не удалось получить пользователя после входа. Попробуйте ещё раз.");
      return;
    }

    const { profile, error: profileError } = await ensureProfileForUser(supabase, data.user);

    if (profileError) {
      setIsSubmitting(false);
      setError("Вход выполнен, но профиль не загрузился. Попробуйте ещё раз.");
      return;
    }

    router.refresh();
    router.push(
      (isProfileOnboardingComplete(profile) ? nextPath : getOnboardingPath(nextPath)) as never
    );
  }

  return (
    <form onSubmit={submitLogin} className="space-y-4 sm:space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm sm:h-14"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Пароль</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="focus-ring mt-2 h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm sm:h-14"
          placeholder="Введите пароль"
          autoComplete="current-password"
        />
      </label>

      {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}
      {emailConfirmed ? (
        <p className="rounded-2xl bg-mist p-4 text-sm font-semibold text-leaf">
          Email подтверждён. Теперь войдите в Choi с вашим email и паролем.
        </p>
      ) : null}
      {registrationPending ? (
        <p className="rounded-2xl bg-mist p-4 text-sm font-semibold leading-6 text-leaf">
          Аккаунт создан. Проверьте почту
          {pendingEmail ? ` ${pendingEmail}` : ""} и подтвердите регистрацию, затем войдите.
        </p>
      ) : null}
      {confirmationError ? (
        <p className="rounded-2xl bg-[#fff2ef] p-4 text-sm font-semibold text-coral">
          Не удалось подтвердить email. Попробуйте войти еще раз или запросите новое письмо.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring h-12 w-full rounded-full bg-leaf px-6 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70 sm:h-14"
      >
        {isSubmitting ? "Входим..." : "Войти"}
      </button>

      <p className="text-center text-sm text-ink/62">
        Нет аккаунта?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(nextPath)}` as never}
          className="font-semibold text-leaf hover:underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
