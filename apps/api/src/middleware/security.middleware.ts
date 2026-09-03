import { secureHeaders } from "hono/secure-headers";

const isProduction =
  process.env.NODE_ENV === "production";

export const securityHeaders =
  secureHeaders({
    /*
     * L'API ne doit pas être affichée
     * dans une iframe.
     */
    xFrameOptions: "DENY",

    /*
     * Évite l'envoi d'informations
     * de navigation via Referer.
     */
    referrerPolicy: "no-referrer",

    /*
     * HSTS seulement en production.
     *
     * À activer uniquement lorsque
     * l'API est réellement servie en HTTPS.
     */
    strictTransportSecurity:
      isProduction
        ? "max-age=31536000; includeSubDomains"
        : false,

  });