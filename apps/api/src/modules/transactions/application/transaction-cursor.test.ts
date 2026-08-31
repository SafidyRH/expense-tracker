import {
  describe,
  expect,
  it,
} from "vitest";

import {
  decodeTransactionCursor,
  encodeTransactionCursor,
} from "./transaction-cursor.js";

describe("transaction cursor", () => {
  it("encodes and decodes a transaction cursor", () => {
    const cursor = {
      id: "transaction-1",
      occurredAt:
        new Date("2026-01-15T10:00:00.000Z"),
    };

    const encoded =
      encodeTransactionCursor(cursor);

    expect(encoded).toEqual(
      expect.any(String)
    );
    expect(
      decodeTransactionCursor(encoded)
    ).toEqual(cursor);
  });

  it("returns null for invalid cursors", () => {
    expect(
      decodeTransactionCursor("not-a-valid-cursor")
    ).toBeNull();

    expect(
      decodeTransactionCursor(
        Buffer
          .from(
            JSON.stringify({
              id: 123,
              occurredAt:
                "2026-01-15T10:00:00.000Z",
            })
          )
          .toString("base64url")
      )
    ).toBeNull();

    expect(
      decodeTransactionCursor(
        Buffer
          .from(
            JSON.stringify({
              id: "transaction-1",
              occurredAt: "invalid-date",
            })
          )
          .toString("base64url")
      )
    ).toBeNull();
  });
});
