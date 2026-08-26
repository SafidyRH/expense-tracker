export function formatMoney(
  amountMinor:
    | string
    | bigint,
  currencyCode = "MGA"
) {
  const amount =
    typeof amountMinor ===
    "bigint"
      ? amountMinor
      : BigInt(amountMinor);

  if (
    currencyCode ===
    "MGA"
  ) {
    return `${amount.toLocaleString(
      "fr-FR"
    )} Ar`;
  }

  return `${amount.toLocaleString(
    "fr-FR"
  )} ${currencyCode}`;
}