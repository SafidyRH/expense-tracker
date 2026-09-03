const frontendUrl =
  process.env.FRONTEND_URL ??
  "http://localhost:3000";

export const corsConfig = {
  origin: frontendUrl,

  credentials: true,

  allowMethods: [
    "GET",
    "POST",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Request-ID",
  ],

  exposeHeaders: [
    "X-Request-ID",
  ],

  maxAge: 600,
};