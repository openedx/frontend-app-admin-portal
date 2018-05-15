const sessionKey = 'session';

export const AuthService = {
  authenticate(provider, redirectPath = '/', storage = window.localStorage, localWindow = window) {
    localWindow.location = provider.buildAuthorizeUrl(redirectPath);
  },

  extractSession(provider, storage = window.localStorage, localWindow = window) {
    const redirectUrl = localWindow.location.href;

    const error = provider.extractError(redirectUrl);
    if (error) {
      console.log(error);
      return;
    }

    const session = provider.extractSession(redirectUrl);
    storage.setItem(sessionKey, JSON.stringify(session));
  },

  extractRedirectPath(provider, storage = window.localStorage, localWindow = window) {
    const redirectUrl = localWindow.location.href;

    const error = provider.extractError(redirectUrl);
    if (error) {
      console.log(error);
      return;
    }

    return provider.extractRedirectPath(redirectUrl);
  },

  restoreSession(provider, storage = window.localStorage) {
    const sessionString = storage.getItem(sessionKey);
    if (typeof sessionString !== 'string' || sessionString.length === 0) {
      return undefined;
    }

    const session = JSON.parse(sessionString);

    if (!provider.validateSession(session)) {
      storage.removeItem(sessionKey);
      return undefined;
    }

    return session;
  },

  invalidateSession(storage = window.localStorage) {
    storage.removeItem(sessionKey);
  },

  getAccessToken(provider, storage = window.localStorage) {
    const sessionString = storage.getItem(sessionKey);
    if (typeof sessionString !== 'string' || sessionString.length === 0) {
      throw new Error(
        `You attempted to get access token for a resource from the session but the session did not exist`
      );
    }

    const session = JSON.parse(sessionString);

    return provider.getAccessToken(session);
  }
};

export default AuthService;
