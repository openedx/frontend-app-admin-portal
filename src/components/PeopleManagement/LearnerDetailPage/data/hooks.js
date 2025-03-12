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
    firstName: '',
    lastName: '',
    email: '',
    dateJoined: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await LmsApiService.fetchEnterpriseLearnerData(enterpriseUUID, learnerId, undefined);
        const results = await camelCaseObject(data);
        setLearnerData(results[0].user);
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
