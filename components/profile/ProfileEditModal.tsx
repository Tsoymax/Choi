"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ChoiUser } from "@/utils/users";
import { updateCurrentUser } from "@/utils/users";
import { tashkentDistricts } from "@/components/sell/sellData";

type ProfileEditModalProps = {
  user: ChoiUser;
  onClose: () => void;
  onSave: (user: ChoiUser) => void;
  onSaveProfile?: (input: {
    name: string;
    district: string;
    addressMode: "aka" | "opa";
  }) => Promise<ChoiUser>;
};

export function ProfileEditModal({
  user,
  onClose,
  onSave,
  onSaveProfile
}: ProfileEditModalProps) {
  const [name, setName] = useState(user.name);
  const [district, setDistrict] = useState(user.district);
  const [addressMode, setAddressMode] = useState(user.addressMode);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveProfile() {
    setError("");

    setIsSaving(true);

    try {
      const input = {
        name: name.trim() || user.name,
        district,
        addressMode
      };
      const nextUser = onSaveProfile
        ? await onSaveProfile(input)
        : updateCurrentUser(input);

      onSave(nextUser);
      onClose();
    } catch {
      setError("Не удалось сохранить профиль. Попробуйте еще раз.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/28 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(24,32,29,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-ink">Редактировать профиль</h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-mist text-ink"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Имя</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="focus-ring mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white px-4 text-base font-medium text-ink shadow-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Район</span>
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
              {(["aka", "opa"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAddressMode(mode)}
                  className={`focus-ring h-12 rounded-2xl border text-sm font-semibold transition ${
                    addressMode === mode
                      ? "border-leaf bg-leaf text-white"
                      : "border-ink/10 bg-white text-ink hover:border-leaf/30"
                  }`}
                >
                  {mode === "aka" ? "Ака" : "Опа"}
                </button>
              ))}
            </div>
          </div>

        </div>

        {error ? <p className="mt-4 text-sm font-semibold text-coral">{error}</p> : null}

        <button
          type="button"
          onClick={saveProfile}
          disabled={isSaving}
          className="focus-ring mt-7 h-14 w-full rounded-full bg-leaf px-6 text-base font-semibold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
        >
          {isSaving ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
