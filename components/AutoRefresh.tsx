"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REFRESH_INTERVAL = 20_000;

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    let lastRefresh = Date.now();

    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      lastRefresh = Date.now();
      router.refresh();
    };

    const interval = window.setInterval(refresh, REFRESH_INTERVAL);
    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastRefresh >= REFRESH_INTERVAL
      ) {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
