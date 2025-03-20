import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';

import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * A React hook that manages the fetches enterprise learner data in order to
 * render the learner detail page
 *
 * @param {string} enterpriseUUID EnterpriseCustomer UUID
 * @param {string} learnerId Enterprise customer learner id
 * @returns An object containing `isLoading` and `learnerData`.
 */
export const useEnterpriseLearnerData = (enterpriseUUID, learnerId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [learnerData, setLearnerData] = useState({
    userId: '',
    name: '',
    email: '',
    joinedOrg: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const options = { user_id: learnerId };
        const data = await LmsApiService.fetchEnterpriseCustomerMembers(enterpriseUUID, options);
        const results = await camelCaseObject(data);
        setLearnerData(results.data.results[0].enterpriseCustomerUser);
      } catch (err) {
        logError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (enterpriseUUID && learnerId) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [enterpriseUUID, learnerId]);

  return {
    isLoading,
    learnerData,
  };
};
