"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2, MapPin, UserRound } from "lucide-react";
import { tashkentDistricts } from "@/components/sell/sellData";
import {
  getSafeProfileNext,
  updateCurrentProfile,
  type ProfileRow
} from "@/lib/data/profiles";
import {
  LOCATION_EVENT,
  setGuestDistrict
} from "@/lib/location/currentLocation";

type ProfileOnboardingFormProps = {
  initialProfile: ProfileRow;
  nextPath: string;
};

export function ProfileOnboardingForm({
  initialProfile,
  nextPath
}: ProfileOnboardingFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialProfile.name ?? "");
  const [district, setDistrict] = useState(initialProfile.district ?? "");
  const [addressType, setAddressType] = useState<"aka" | "opa">(
    initialProfile.address_type === "opa" ? "opa" : "aka"
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submitOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Введите имя.");
      return;
    }

    if (!district) {
      setError("Выберите район.");
      return;
    }

    setIsSaving(true);
    const { profile, error: profileError } = await updateCurrentProfile({
      name: name.trim(),
      district,
      addressType
    });
    setIsSaving(false);

    if (profileError || !profile) {
      setError("Не удалось сохранить настройки профиля. Попробуйте ещё раз.");
      return;
    }

    setGuestDistrict(district);
    window.dispatchEvent(new Event(LOCATION_EVENT));
    router.refresh();
    router.push(getSafeProfileNext(nextPath) as never);
  }

  return (
    <form onSubmit={submitOnboarding} className="space-y-6">
      <div className="rounded-[24px] bg-mist p-5">
        <Image
          src="/images/choi-teapot.png"
          alt="Choi"
          width={92}
          height={92}
          className="mb-4 rounded-2xl"
          priority
        />
        <h3 className="text-2xl font-semibold text-ink">Настроим ваш Choi</h3>
        <p className="mt-2 text-sm leading-6 text-ink/62">
          Район нужен, чтобы показывать объявления рядом. Обращение помогает правильно
          отображать уровень доверия: Ака или Опа.
        </p>
      </div>

      <label className="block">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <UserRound size={17} className="text-leaf" />
          Имя
        </span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
          placeholder="Как вас зовут?"
          autoComplete="name"
        />
      </label>

      <label className="block">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <MapPin size={17} className="text-leaf" />
          Район
        </span>
        <select
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
        >
          <option value="">Выберите район</option>
          {tashkentDistricts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="text-sm font-semibold text-ink">Как к вам обращаться?</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {(["aka", "opa"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAddressType(type)}
              className={`focus-ring h-14 rounded-2xl border text-base font-semibold transition ${
                addressType === type
                  ? "border-leaf bg-leaf text-white shadow-lg shadow-leaf/18"
                  : "border-ink/10 bg-white text-ink hover:border-leaf/30"
              }`}
            >
              {type === "aka" ? "Ака" : "Опа"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl bg-[#fff2ef] p-4 text-sm font-semibold text-coral">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="focus-ring inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-leaf px-6 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d] disabled:cursor-wait disabled:opacity-70"
      >
        <CheckCircle2 size={20} />
        {isSaving ? "Сохраняем..." : "Продолжить"}
      </button>
    </form>
  );
}
