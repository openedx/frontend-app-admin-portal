import { useState, useEffect } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import DiscoveryApiService from '../../../data/services/DiscoveryApiService';

// eslint-disable-next-line import/prefer-default-export
export const useCourseDetails = (courseKey) => {
  const [courseDetails, setCourseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    () => {
      const getCourseDetails = async () => {
        setIsLoading(true);
        try {
          const response = await DiscoveryApiService.fetchCourseDetails(courseKey);
          const result = camelCaseObject(response.data);
          setCourseDetails(result);
        } catch (err) {
          logError(err);
        } finally {
          setIsLoading(false);
        }
      };
      getCourseDetails();
    },
    [courseKey],
  );

  return [courseDetails, isLoading];
};
