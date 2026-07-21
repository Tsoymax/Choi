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

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNext(searchParams.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    if (!name.trim()) {
      return "Введите имя.";
    }
    if (!email.includes("@")) {
      return "Введите корректный email.";
    }
    if (password.length < 8) {
      return "Пароль должен быть минимум 8 символов.";
    }
    if (password !== confirmPassword) {
      return "Пароли не совпадают.";
    }

    return "";
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    callbackUrl.searchParams.set("next", nextPath);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim()
        },
        emailRedirectTo: callbackUrl.toString()
      }
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError("Не удалось создать аккаунт. Проверьте данные и попробуйте снова.");
      return;
    }

    if (data.session && data.user) {
      const { profile, error: profileError } = await ensureProfileForUser(supabase, data.user);

      if (profileError) {
        setError("Аккаунт создан, но профиль не загрузился. Попробуйте войти ещё раз.");
        return;
      }

      router.refresh();
      router.push(
        (isProfileOnboardingComplete(profile) ? nextPath : getOnboardingPath(nextPath)) as never
      );
      return;
    }

    setMessage("Проверьте почту и подтвердите регистрацию");
  }

  return (
    <form onSubmit={submitRegister} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-ink">Имя</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
          placeholder="Как вас зовут?"
          autoComplete="name"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
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
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
          placeholder="Минимум 8 символов"
          autoComplete="new-password"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Повторите пароль</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
          placeholder="Повторите пароль"
          autoComplete="new-password"
        />
      </label>

      {error ? <p className="text-sm font-semibold text-coral">{error}</p> : null}
      {message ? (
        <p className="rounded-2xl bg-mist p-4 text-sm font-semibold text-leaf">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring h-14 w-full rounded-full bg-leaf px-6 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Создаем..." : "Создать аккаунт"}
      </button>

      <p className="text-center text-sm text-ink/62">
        Уже есть аккаунт?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}` as never}
          className="font-semibold text-leaf hover:underline"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
