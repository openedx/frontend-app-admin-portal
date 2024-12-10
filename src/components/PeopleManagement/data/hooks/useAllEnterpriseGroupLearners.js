import {
  useEffect, useState,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';

import LmsApiService from '../../../../data/services/LmsApiService';

const useAllEnterpriseGroupLearners = (groupUuid) => {
  const [isLoading, setIsLoading] = useState(true);
  const [enterpriseGroupLearners, setEnterpriseGroupLearners] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const response = await LmsApiService.fetchAllEnterpriseGroupLearners(groupUuid);
        setEnterpriseGroupLearners(
          response,
        );
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [groupUuid]);

  return {
    isLoading,
    enterpriseGroupLearners,
  };
};

export default useAllEnterpriseGroupLearners;
