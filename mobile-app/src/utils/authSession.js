const { isUnauthorizedError } = require('../api/errors');

function buildSessionFromUser(token, user, fallbackSession = {}) {
  return {
    token,
    userId: user?.id || user?.userId || fallbackSession.userId,
    name: user?.name || fallbackSession.name || '',
    email: user?.email || fallbackSession.email || '',
    role: user?.role || fallbackSession.role,
  };
}

function isAdminRole(role) {
  return role === 'ADMIN';
}

function shouldClearSessionForRestoreError(error) {
  return isUnauthorizedError(error);
}

module.exports = {
  buildSessionFromUser,
  isAdminRole,
  shouldClearSessionForRestoreError,
};
