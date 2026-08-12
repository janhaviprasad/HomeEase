import { COLORS } from './colors';

export const SHADOWS = {
  card: {
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const STATUS = {
  PENDING: { bg: '#f1f5f9', fg: COLORS.TEXT_MUTED, label: 'Pending' },
  ACCEPTED: { bg: COLORS.ACCENT_SOFT, fg: COLORS.ACCENT, label: 'Accepted' },
  IN_PROGRESS: { bg: COLORS.WARNING_SOFT, fg: COLORS.WARNING_TEXT, label: 'In Progress' },
  COMPLETED: { bg: COLORS.SUCCESS_SOFT, fg: COLORS.SUCCESS, label: 'Completed' },
  CANCELLED: { bg: COLORS.ERROR_SOFT, fg: COLORS.ERROR, label: 'Cancelled' },
};
