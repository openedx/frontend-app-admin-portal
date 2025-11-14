import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { LoginRedirect, getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import { isEnterpriseUser, ENTERPRISE_ADMIN } from '@edx/frontend-enterprise-utils';
import { v5 as uuidv5 } from 'uuid';

import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import LmsApiService from '../../data/services/LmsApiService';

/**
 * AdminRegisterPage is a React component that manages the registration process for enterprise administrators.
 *
 * The component:
 * - Redirects unauthenticated users to the enterprise proxy login flow.
 * - For authenticated users:
 *   - Checks if they have the `enterprise_admin` JWT role associated with the specified enterprise.
 *   - Redirects users with the `enterprise_admin` role to the account activation page.
 *   - Redirects other authenticated users to the proxy login URL to refresh their JWT cookie
 *     and retrieve updated role assignments.
 * - Fetches enterprise information by slug and processes the authenticated enterprise admin state.
 * - Ensures that users visiting the register page for the first time will have the page reloaded
 *   for proper initialization.
 *
 * Dependencies:
 * - `getAuthenticatedUser`: Retrieves the currently authenticated user.
 * - `useParams`: React Router hook used to extract route parameters.
 * - `useNavigate`: React Router hook for programmatically navigating to different routes.
 * - `LmsApiService.fetchEnterpriseBySlug`: Fetches enterprise details by their slug.
 * - `LmsApiService.loginRefresh`: Refreshes user login session and retrieves user details.
 * - `isEnterpriseUser`: Validates if a user has a specific role within an enterprise.
 * - `getProxyLoginUrl`: Constructs a URL for redirecting to the enterprise proxy login flow.
 * - `uuidv5`: Used to generate a unique identifier for storage purposes.
 * - `EnterpriseAppSkeleton`: Component displayed as a loading or placeholder state.
 * - `LoginRedirect`: Component to handle login redirection with a loading display.
 *
 * Side Effects:
 * - Utilizes `useEffect` to handle asynchronous data fetching, user authentication validation, and navigation.
 * - Stores a flag in `localStorage` to identify if a user is visiting the register page for the first time.
 * - Logs errors encountered during the asynchronous operations.
 *
 * Returns:
 * - If the user is not authenticated, renders the `LoginRedirect` component for managing redirection
 *   to the proxy login flow.
 * - If the user is authenticated, renders the `EnterpriseAppSkeleton` as a placeholder or loading
 *   state during processing.
 */
const AdminRegisterPage = () => {
  const user = getAuthenticatedUser();
  const { enterpriseSlug } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      return;
    }
    const processEnterpriseAdmin = (enterpriseUUID) => {
      const authenticatedUser = getAuthenticatedUser();
      const isEnterpriseAdmin = isEnterpriseUser(authenticatedUser, ENTERPRISE_ADMIN, enterpriseUUID);
      if (isEnterpriseAdmin) {
        // user is authenticated and has the ``enterprise_admin`` JWT role, so redirect user to
        // account activation page to ensure they verify their email address.
        navigate(`/${enterpriseSlug}/admin/register/activate`);
      } else {
        // user is authenticated but doesn't have the `enterprise_admin` JWT role; redirect to
        // proxy login to refresh JWT cookie and pick up any new role assignments.
        global.location.href = getProxyLoginUrl(enterpriseSlug);
      }
    };

    const getEnterpriseBySlug = async () => {
      try {
        const response = await LmsApiService.fetchEnterpriseBySlug(enterpriseSlug);
        if (response.data && response.data.uuid) {
          processEnterpriseAdmin(response.data.uuid);
        }
      } catch (error) {
        logError(error);
      }
    };
    // Force a fetch of a new JWT token and reload the page prior to any redirects.
    // Importantly, only reload the page on first visit, or else risk infinite reloads.
    LmsApiService.loginRefresh().then(data => {
      const obfuscatedId = uuidv5(String(data.userId), uuidv5.DNS);
      const storageKey = `first_visit_register_page_${obfuscatedId}`;
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, 'true');
        window.location.reload();
      }
      return data;
    }).catch(error => logError(error));
    getEnterpriseBySlug().catch(error => logError(error));
  }, [user, navigate, enterpriseSlug]);

  if (!user) {
    // user is not authenticated, so redirect to enterprise proxy login flow
    return (
      <LoginRedirect
        loadingDisplay={<EnterpriseAppSkeleton />}
      />
    );
  }

  return <EnterpriseAppSkeleton />;
};

export default AdminRegisterPage;
