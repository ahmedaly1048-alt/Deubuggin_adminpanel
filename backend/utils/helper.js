function normalizeDate(val) {
  if (!val || val.trim() === "") return null;
  return val.split("T")[0];
}

function normalizeInt(value, defaultVal = 1) {
  const n = Number(value);
  return Number.isInteger(n) ? n : defaultVal;
}

module.exports = { normalizeDate, normalizeInt };
