export function getCurrentMonthRange() {
  const now =
    new Date();

  const start =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

  const end =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

  return {
    from:
      start.toISOString(),

    to:
      end.toISOString(),
  };
}

export function getLastSevenDaysRange() {
  const end =
    new Date();

  const start =
    new Date();

  start.setDate(
    start.getDate() - 6
  );

  start.setHours(
    0,
    0,
    0,
    0
  );

  return {
    from:
      start.toISOString(),

    to:
      end.toISOString(),
  };
}

export function formatMonthYear(
  date = new Date()
) {
  const value =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        month: "long",
        year: "numeric",
      }
    ).format(date);

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}