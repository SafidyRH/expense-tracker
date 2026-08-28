"use client";

import {
  useEffect,
} from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (
      !("serviceWorker" in navigator)
    ) {
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
