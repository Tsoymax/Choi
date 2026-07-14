"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_UNTIL_KEY = "choi_pwa_install_dismissed_until";
const IOS_HINT_SEEN_KEY = "choi_pwa_ios_hint_seen";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIosSafari() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);

  return isIos && isSafari;
}

function isDismissedRecently() {
  const dismissedUntil = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY) ?? 0);
  return dismissedUntil > Date.now();
}

export function InstallChoiPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const iosCopy = useMemo(
    () => ({
      title: "Установить Choi",
      body: "Чтобы установить Choi: нажмите “Поделиться” → “На экран Домой”"
    }),
    []
  );

  useEffect(() => {
    if (isStandaloneMode() || isDismissedRecently()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIosSafari() && window.localStorage.getItem(IOS_HINT_SEEN_KEY) !== "true") {
      setShowIosHint(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_MS));
    window.localStorage.setItem(IOS_HINT_SEEN_KEY, "true");
    setShowPrompt(false);
    setShowIosHint(false);
  }

  async function install() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setShowPrompt(false);
  }

  if (!showPrompt && !showIosHint) {
    return null;
  }

  return (
    <aside className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+96px)] z-[70] mx-auto max-w-md rounded-[24px] border border-leaf/12 bg-white p-4 shadow-2xl shadow-ink/15 md:bottom-6 md:left-auto md:right-6 md:mx-0">
      <button
        type="button"
        onClick={dismiss}
        className="focus-ring absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-ink/50 hover:bg-mist hover:text-ink"
        aria-label="Закрыть"
      >
        <X size={18} />
      </button>

      <div className="flex gap-3 pr-8">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf text-white">
          {showIosHint ? <Share size={20} /> : <Download size={20} />}
        </div>
        <div>
          <h2 className="text-base font-bold text-ink">
            {showIosHint ? iosCopy.title : "Установить Choi"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-ink/65">
            {showIosHint
              ? iosCopy.body
              : "Открывайте объявления и чаты как обычное приложение"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {showPrompt ? (
          <button
            type="button"
            onClick={install}
            className="focus-ring flex-1 rounded-full bg-leaf px-4 py-3 text-sm font-bold text-white shadow-lg shadow-leaf/20 transition hover:bg-[#3f6d4d]"
          >
            Установить
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="focus-ring flex-1 rounded-full border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-mist"
        >
          Не сейчас
        </button>
      </div>
    </aside>
  );
}
