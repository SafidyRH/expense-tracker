"use client";

import {
  useEffect,
} from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        )
        .catch(() => {
          // Dev still works if a browser blocks service worker cleanup.
        });
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // Registration can fail in local private contexts; the app still works online.
      });
  }, []);

  return null;
}
