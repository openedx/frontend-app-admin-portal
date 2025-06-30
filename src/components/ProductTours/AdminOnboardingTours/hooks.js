import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import LmsApiService from "../../../data/services/LmsApiService";

/**
 * This hook returns the first enterprise customer member
 */
export const useSingleEnterpriseCustomerMember = ( enterpriseId ) => {
  const [enterpriseMemberId, setEnterpriseMemberId] = useState(null);

  useEffect(() => {
    const fetchSingleEnterpriseCustomerMember = async () => {
      try {
        const response = await LmsApiService.fetchSingleEnterpriseCustomerMember(enterpriseId);
        const data = camelCaseObject(response.data);
        setEnterpriseMemberId(data.results[0].enterpriseCustomerUser.userId);
      } catch (err) {
        logError(err);
      }
    };
    fetchSingleEnterpriseCustomerMember();
  }, [enterpriseId]);

  return enterpriseMemberId;
};
