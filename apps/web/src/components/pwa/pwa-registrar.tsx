"use client";

import {
  useEffect,
} from "react";

const DEV_SERVICE_WORKER_CLEANUP_KEY = "expense-tracker-sw-dev-cleaned";
const SERVICE_WORKER_CACHE_PREFIX = "expense-tracker-";

export function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      const hadController = Boolean(navigator.serviceWorker.controller);
      const clearRuntimeCaches =
        "caches" in window
          ? caches
              .keys()
              .then((keys) =>
                Promise.all(
                  keys
                    .filter((key) => key.startsWith(SERVICE_WORKER_CACHE_PREFIX))
                    .map((key) => caches.delete(key)),
                ),
              )
          : Promise.resolve([]);

      Promise.all([
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) =>
            Promise.all(
              registrations.map((registration) => registration.unregister()),
            ),
          ),
        clearRuntimeCaches,
      ])
        .then(() => {
          if (
            hadController &&
            !sessionStorage.getItem(DEV_SERVICE_WORKER_CLEANUP_KEY)
          ) {
            sessionStorage.setItem(DEV_SERVICE_WORKER_CLEANUP_KEY, "true");
            window.location.reload();
          }
        })
        .catch(() => {
          // Dev still works if a browser blocks service worker cleanup.
        });
      return;
    }

    sessionStorage.removeItem(DEV_SERVICE_WORKER_CLEANUP_KEY);

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // Registration can fail in local private contexts; the app still works online.
      });
  }, []);

  return null;
}
