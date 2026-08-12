const AsyncStorageModule = require('@react-native-async-storage/async-storage');

const AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;

const STORAGE_KEYS = {
  token: 'token',
  userId: 'userId',
  name: 'name',
  email: 'email',
  role: 'role',
};

function hasRequiredSessionFields(session) {
  return Boolean(session && session.token && session.userId && session.role);
}

function normalizeStoredSession(values) {
  const session = {
    token: values[STORAGE_KEYS.token],
    userId: values[STORAGE_KEYS.userId] ? Number(values[STORAGE_KEYS.userId]) : null,
    name: values[STORAGE_KEYS.name] || null,
    email: values[STORAGE_KEYS.email] || null,
    role: values[STORAGE_KEYS.role] || null,
  };

  if (!session.userId || Number.isNaN(session.userId)) {
    session.userId = null;
  }

  return session;
}

function createSessionStorage(storage = AsyncStorage) {
  async function clearSession() {
    await storage.multiRemove(Object.values(STORAGE_KEYS));
  }

  async function readStoredSession() {
    const entries = await storage.multiGet(Object.values(STORAGE_KEYS));
    const values = Object.fromEntries(entries);
    const session = normalizeStoredSession(values);

    if (!hasRequiredSessionFields(session)) {
      await clearSession();
      return null;
    }

    return session;
  }

  async function saveSession(session) {
    if (!hasRequiredSessionFields(session)) {
      throw new Error('Cannot save incomplete session.');
    }

    await storage.multiSet([
      [STORAGE_KEYS.token, String(session.token)],
      [STORAGE_KEYS.userId, String(session.userId)],
      [STORAGE_KEYS.name, session.name ? String(session.name) : ''],
      [STORAGE_KEYS.email, session.email ? String(session.email) : ''],
      [STORAGE_KEYS.role, String(session.role)],
    ]);
  }

  return {
    clearSession,
    readStoredSession,
    saveSession,
  };
}

const defaultSessionStorage = createSessionStorage();

module.exports = {
  STORAGE_KEYS,
  clearSession: defaultSessionStorage.clearSession,
  createSessionStorage,
  hasRequiredSessionFields,
  readStoredSession: defaultSessionStorage.readStoredSession,
  saveSession: defaultSessionStorage.saveSession,
};
