"use client";

import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InstallChoiPrompt } from "./InstallChoiPrompt";
import { useNetworkStatus } from "./useNetworkStatus";

type NetworkToast = {
  type: "online" | "offline";
  message: string;
};

export function PWAController() {
  const isOnline = useNetworkStatus();
  const previousOnline = useRef<boolean | null>(null);
  const [networkToast, setNetworkToast] = useState<NetworkToast | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }

    let reloadPending = false;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;

          if (!installingWorker) {
            return;
          }

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(installingWorker);
            }
          });
        });
      })
      .catch(() => {
        setWaitingWorker(null);
      });

    const handleControllerChange = () => {
      if (reloadPending) {
        return;
      }

      reloadPending = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  useEffect(() => {
    if (previousOnline.current === null) {
      previousOnline.current = isOnline;
      return;
    }

    if (previousOnline.current === isOnline) {
      return;
    }

    previousOnline.current = isOnline;
    setNetworkToast({
      type: isOnline ? "online" : "offline",
      message: isOnline ? "Соединение восстановлено" : "Нет подключения к интернету"
    });

    const timeout = window.setTimeout(() => setNetworkToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [isOnline]);

  function activateUpdate() {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }

  return (
    <>
      <InstallChoiPrompt />

      {waitingWorker ? (
        <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+96px)] z-[75] mx-auto flex max-w-md items-center gap-3 rounded-[22px] border border-leaf/15 bg-white p-4 shadow-2xl shadow-ink/15 md:bottom-6 md:left-auto md:right-6 md:mx-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf text-white">
            <RefreshCw size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">Доступно обновление Choi</p>
            <p className="text-xs text-ink/55">Обновите приложение до свежей версии.</p>
          </div>
          <button
            type="button"
            onClick={activateUpdate}
            className="focus-ring rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3f6d4d]"
          >
            Обновить
          </button>
        </div>
      ) : null}

      {networkToast ? (
        <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+16px)] z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-3 text-sm font-bold text-ink shadow-xl shadow-ink/10">
          {networkToast.type === "online" ? (
            <Wifi size={18} className="text-leaf" />
          ) : (
            <WifiOff size={18} className="text-[#b15b4c]" />
          )}
          {networkToast.message}
        </div>
      ) : null}
    </>
  );
}
