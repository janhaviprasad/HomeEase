const SESSION_KEYS = [
  "token",
  "adminName",
  "adminEmail",
  "role",
];

export function clearSession() {
  SESSION_KEYS.forEach((key) =>
    localStorage.removeItem(key)
  );
}
