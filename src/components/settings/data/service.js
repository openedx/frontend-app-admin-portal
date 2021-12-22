/* eslint-disable import/prefer-default-export */

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const getAccessLinks = (enterpriseUUID) => {
  const queryParams = new URLSearchParams();
  queryParams.append('enterprise_customer_uuid', enterpriseUUID);
  const url = `${getConfig().LMS_BASE_URL}/enterprise/api/v1/enterprise-customer-invite-key/basic-list/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};
