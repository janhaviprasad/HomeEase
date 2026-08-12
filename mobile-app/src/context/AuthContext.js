import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../api/auth';
import { isNetworkError } from '../api/errors';
import {
  clearSession,
  hasRequiredSessionFields,
  readStoredSession,
  saveSession,
} from '../utils/sessionStorage';
import {
  buildSessionFromUser,
  shouldClearSessionForRestoreError,
} from '../utils/authSession';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  restoreError: null,
  isAuthenticated: false,
  signIn: async () => {},
  completeAuthentication: async () => {},
  refreshCurrentUser: async () => {},
  retryRestore: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState(null);

  const applyAuthenticatedUser = useCallback(async (nextToken, nextUser, fallbackSession = {}) => {
    const nextSession = buildSessionFromUser(nextToken, nextUser, fallbackSession);
    if (!hasRequiredSessionFields(nextSession)) {
      throw new Error('Cannot complete authentication without token, userId, and role.');
    }

    await saveSession(nextSession);
    setToken(nextToken);
    setUser({
      ...nextUser,
      id: nextSession.userId,
      name: nextSession.name,
      email: nextSession.email,
      role: nextSession.role,
    });
    setRestoreError(null);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    setToken(null);
    setRestoreError(null);
  }, []);

  const refreshCurrentUser = useCallback(
    async (currentToken = token, fallbackSession = {}) => {
      if (!currentToken) {
        throw new Error('Cannot refresh current user without a token.');
      }

      const currentUser = await authService.me();
      await applyAuthenticatedUser(currentToken, currentUser, fallbackSession);
      return currentUser;
    },
    [applyAuthenticatedUser, token]
  );

  const restoreSession = useCallback(async () => {
    setLoading(true);
    setRestoreError(null);

    try {
      const storedSession = await readStoredSession();
      if (!storedSession) {
        setUser(null);
        setToken(null);
        return;
      }

      setToken(storedSession.token);
      await refreshCurrentUser(storedSession.token, storedSession);
    } catch (error) {
      if (shouldClearSessionForRestoreError(error)) {
        await clearSession();
        setUser(null);
        setToken(null);
        return;
      }

      if (isNetworkError(error)) {
        setRestoreError(error);
        return;
      }

      await clearSession();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [refreshCurrentUser]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const completeAuthentication = useCallback(
    async (session) => {
      if (!hasRequiredSessionFields(session)) {
        throw new Error('Cannot complete authentication without token, userId, and role.');
      }

      await saveSession(session);
      setToken(session.token);

      const currentUser = await authService.me();
      await applyAuthenticatedUser(session.token, currentUser, session);
      return currentUser;
    },
    [applyAuthenticatedUser]
  );

  const signIn = useCallback(
    async (session) => completeAuthentication(session),
    [completeAuthentication]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      restoreError,
      isAuthenticated: Boolean(user && token),
      signIn,
      completeAuthentication,
      refreshCurrentUser,
      retryRestore: restoreSession,
      signOut,
    }),
    [
      completeAuthentication,
      loading,
      refreshCurrentUser,
      restoreError,
      restoreSession,
      signIn,
      signOut,
      token,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
