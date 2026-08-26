import type {
  TransactionCursor,
} from "../domain/transaction-history.js";

export function encodeTransactionCursor(
  cursor: TransactionCursor
): string {
  const payload = JSON.stringify({
    occurredAt:
      cursor.occurredAt.toISOString(),

    id: cursor.id,
  });

  return Buffer
    .from(payload)
    .toString("base64url");
}

export function decodeTransactionCursor(
  cursor: string
): TransactionCursor | null {
  try {
    const decoded = Buffer
      .from(
        cursor,
        "base64url"
      )
      .toString("utf8");

    const parsed =
      JSON.parse(decoded);

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.occurredAt !==
        "string"
    ) {
      return null;
    }

    const occurredAt =
      new Date(
        parsed.occurredAt
      );

    if (
      Number.isNaN(
        occurredAt.getTime()
      )
    ) {
      return null;
    }

    return {
      id: parsed.id,
      occurredAt,
    };
  } catch {
    return null;
  }
}