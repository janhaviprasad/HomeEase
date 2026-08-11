import { TONE_CLASSES } from "../utils/bookingStatus";

export default function StatusPill({
  label,
  tone = "neutral",
  title,
}) {
  return (
    <span
      title={title}
      className={`
        inline-block
        px-4
        py-2
        rounded-full
        text-sm
        font-medium
        whitespace-nowrap
        ${TONE_CLASSES[tone] ?? TONE_CLASSES.neutral}
      `}
    >
      {label}
    </span>
  );
}
