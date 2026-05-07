// ⏰ PARSE TIME
function parseTime(input) {

  if (!input) return null;

  const regex =
    /(\d+)\s*(d|day|days|h|hour|hours|m|min|mins|minute|minutes)/gi;

  let totalMs = 0;

  let match;

  while ((match = regex.exec(input)) !== null) {

    const value =
      parseInt(match[1]);

    const unit =
      match[2].toLowerCase();

    // DAYS
    if (
      ["d", "day", "days"]
      .includes(unit)
    ) {
      totalMs +=
        value *
        24 *
        60 *
        60 *
        1000;
    }

    // HOURS
    else if (
      ["h", "hour", "hours"]
      .includes(unit)
    ) {
      totalMs +=
        value *
        60 *
        60 *
        1000;
    }

    // MINUTES
    else if (
      [
        "m",
        "min",
        "mins",
        "minute",
        "minutes"
      ].includes(unit)
    ) {
      totalMs +=
        value *
        60 *
        1000;
    }
  }

  return totalMs > 0
    ? totalMs
    : null;
}

// ⏰ FORMAT TIME
function formatTime(ms) {

  const days =
    Math.floor(
      ms /
      (24 * 60 * 60 * 1000)
    );

  ms %= 24 * 60 * 60 * 1000;

  const hours =
    Math.floor(
      ms /
      (60 * 60 * 1000)
    );

  ms %= 60 * 60 * 1000;

  const mins =
    Math.floor(
      ms /
      (60 * 1000)
    );

  const parts = [];

  if (days)
    parts.push(
      `${days} day${
        days !== 1 ? "s" : ""
      }`
    );

  if (hours)
    parts.push(
      `${hours} hour${
        hours !== 1 ? "s" : ""
      }`
    );

  if (mins)
    parts.push(
      `${mins} minute${
        mins !== 1 ? "s" : ""
      }`
    );

  return parts.join(" ");
}

module.exports = {
  parseTime,
  formatTime
};
