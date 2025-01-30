import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import LmsApiService from '../../../../data/services/LmsApiService';

const useEnterpriseLearners = ({
  enterpriseUUID,
}) => {
  const [allEnterpriseLearners, setAllEnterpriseLearners] = useState([]);

  useEffect(() => {
    const fetchLearnerEmails = async () => {
      try {
        const options = {
          enterprise_customer: enterpriseUUID,
        };
        const data = await LmsApiService.fetchEnterpriseLearnerData(options);
        const results = await camelCaseObject(data);
        const learnerEmails = results.map(result => result?.user?.email);
        setAllEnterpriseLearners(learnerEmails);
      } catch (error) {
        logError(error);
      }
    };
    fetchLearnerEmails();
  }, [enterpriseUUID]);

  return {
    allEnterpriseLearners,
  };
};

export default useEnterpriseLearners;
