import querystring from 'querystring';

export const edxProvider = {
    buildAuthorizeUrl(redirectPath = '/') {
        const authServerHost = 'http://localhost:18000';
        const params = {
            client_id: 'hajKPtEw8j18qFypY0GD23EEjPvobVq3r1YGp7Hs',
            redirect_uri: `${window.location.origin}/complete_login`,
            response_type: 'token',
            state: redirectPath
        };
        return `${authServerHost}/oauth2/authorize/?${querystring.stringify(params)}`;
    },

    extractError(redirectUrl) {
        const errorMatch = redirectUrl.match(/error=([^&]+)/);
        if (!errorMatch) {
            return undefined;
        }

        const errorReason = errorMatch[1];
        const errorDescriptionMatch = redirectUrl.match(/error_description=([^&]+)/);
        const errorDescription = errorDescriptionMatch ? errorDescriptionMatch[1] : '';
        return new Error(`Error during login. Reason: ${errorReason} Description: ${errorDescription}`);
    },

    extractSession(redirectUrl) {
        let accessToken;
        const accessTokenMatch = redirectUrl.match(/access_token=([^&]+)/);
        if (accessTokenMatch) {
            accessToken = accessTokenMatch[1];
        }

        let idToken;
        let decodedIdToken;
        const idTokenMatch = redirectUrl.match(/id_token=([^&]+)/);
        if (idTokenMatch) {
            idToken = idTokenMatch[1];
            decodedIdToken = JSON.parse(atob(idToken.split('.')[1]));
        }

        let expireDurationSeconds = 3600;
        const expireDurationSecondsMatch = redirectUrl.match(/expires_in=([^&]+)/);
        if (expireDurationSecondsMatch) {
            expireDurationSeconds = parseInt(expireDurationSecondsMatch[1]);
        }

        return {
            accessToken,
            expireDurationSeconds,
            idToken,
            decodedIdToken
        };
    },

    extractRedirectPath(redirectUrl) {
        const redirectPathMatch = redirectUrl.match(/state=([^&]+)/);
        return redirectPathMatch ? decodeURIComponent(redirectPathMatch[1]) : '/';
    },

    validateSession(session) {
        //const now = (new Date()).getTime() / 1000;

        // With normal JWT tokens you can inspect the `exp` Expiration claim; however,
        // AAD V2 tokens are opaque and we must use the token meta about expiration time
        // "When you request an access token from the v2.0 endpoint, the v2.0 endpoint also returns metadata about the access token for your app to use."
        // See: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-tokens
        // Here we are leveraging the fact that the access token was issued at the same
        // time as the ID token and can use its `iat` Issued At claim + the duration
        // to compute an absolute expiration time
        // const expiration = session.decodedIdToken.iat + session.expireDurationSeconds;

        // 15 minutes minimum duration until token expires
        //const minimumDuration = 60 * 15;
        //return (expiration - now) > minimumDuration;
        return true;
    },

    getAccessToken(session) {
        return session.accessToken;
    },

    getSignOutUrl(redirectUrl) {
        return `http://localhost:18000`;
    }
}
