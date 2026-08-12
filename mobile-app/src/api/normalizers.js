const MONEY_KEYS = new Set(['totalPrice', 'price']);

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function toCamelCase(key) {
  return key.replace(/_([a-z0-9])/g, (_, character) => character.toUpperCase());
}

function normalizeMoneyValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return value;
  }

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) ? numericValue : value;
}

function normalizeApiPayload(value, parentKey = null) {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiPayload(item, parentKey));
  }

  if (!isPlainObject(value)) {
    return MONEY_KEYS.has(parentKey) ? normalizeMoneyValue(value) : value;
  }

  return Object.entries(value).reduce((normalized, [rawKey, rawValue]) => {
    const normalizedKey = toCamelCase(rawKey);
    normalized[normalizedKey] = normalizeApiPayload(rawValue, normalizedKey);
    return normalized;
  }, {});
}

module.exports = {
  normalizeApiPayload,
  normalizeMoneyValue,
  toCamelCase,
};
