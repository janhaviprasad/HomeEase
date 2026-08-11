import { useState } from "react";

// Circle colours drawn from the tones already in the palette, picked by a hash
// of the user id so the same person is always the same colour.
const CIRCLE_TONES = [
  "bg-teal-600 text-white",
  "bg-green-600 text-white",
  "bg-gray-500 text-white",
  "bg-red-600 text-white",
  "bg-yellow-500 text-gray-900",
];

function toneFor(seed) {
  const text = String(seed ?? "");

  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash =
      (hash + text.charCodeAt(index)) %
      CIRCLE_TONES.length;
  }

  return CIRCLE_TONES[hash];
}

function initialsOf(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

// Three cases for imageUrl:
//   null / ""      → no image, caller falls back to initials
//   http(s)://…    → external, used as-is
//   /uploads/…     → served by the Auth Service, prefixed with its base URL
//
// Not exported: a non-component export from a .jsx file trips
// react-refresh/only-export-components.
function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  const value = String(imageUrl).trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${import.meta.env.VITE_API_URL}${value}`;
  }

  return value;
}

export default function Avatar({
  id,
  name,
  imageUrl,
}) {

  // A browser <img> cannot carry the Bearer token the axios interceptor adds,
  // so an /uploads/ path behind Spring Security will 401 and fire onError.
  // Falling back to initials keeps that failure quiet rather than showing a
  // broken-image icon.
  const [failed, setFailed] = useState(false);

  const source = failed
    ? null
    : resolveImageUrl(imageUrl);

  const baseClass = `
    w-10
    h-10
    rounded-full
    shrink-0
    object-cover
  `;

  if (source) {
    return (
      <img
        src={source}
        alt={name ?? "User"}
        onError={() => setFailed(true)}
        className={baseClass}
      />
    );
  }

  return (
    <div
      className={`
        ${baseClass}
        ${toneFor(id ?? name)}
        flex
        items-center
        justify-center
        text-sm
        font-semibold
      `}
      title={name ?? ""}
    >
      {initialsOf(name)}
    </div>
  );
}
