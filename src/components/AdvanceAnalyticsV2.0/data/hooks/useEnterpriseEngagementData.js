import { useQuery } from '@tanstack/react-query';
import { cloneDeep } from 'lodash-es';

import { useMemo } from 'react';
import { ANALYTICS_TABS, generateKey, COURSE_TYPES } from '../constants';
import { applyGranularity, applyCalculation } from '../utils';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

/**
  Applies data transformations to the response data.

  Apply transformations to the response data based on the granularity and calculation. Data transformation is applied
  only on the items with the allowed enrollment types.

 * @param {object} response - The response data returned from the API.
 * @param {OpUnitType} granularity - Granularity of the data. e.g. `day`, `week`, `month`, `quarter`, `year`.
 * @param {String} calculation - Calculation to apply on the data. e.g.
 *  `total`, `running_total`, `moving_average_3_periods`, `moving_average_7_periods`.
 * @param {Array} allowedEnrollTypes - Allowed enrollment types to consider. e.g. [`certificate`, `audit`].
 */
const applyDataTransformations = (response, granularity, calculation, allowedEnrollTypes = ['certificate', 'audit']) => {
  const modifiedResponse = cloneDeep(response);
  if (modifiedResponse?.data?.engagementOverTime) {
    let engagementOverTime = [];
    for (let i = 0; i < allowedEnrollTypes.length; i++) {
      const data = applyGranularity(
        modifiedResponse.data.engagementOverTime.filter(
          engagement => engagement.enrollType === allowedEnrollTypes[i],
        ),
        'activityDate',
        'learningTimeHours',
        granularity,
      );
      engagementOverTime = engagementOverTime.concat(
        applyCalculation(data, 'learningTimeHours', calculation),
      );
    }

    modifiedResponse.data.engagementOverTime = engagementOverTime;
  }

  return modifiedResponse;
};

/**
 Fetches enterprise engagement data.

 *  @param {String} enterpriseCustomerUUID - UUID of the enterprise customer.
 *  @param {Date} startDate - Start date for the data.
 *  @param {Date} endDate - End date for the data.
 *  @param {OpUnitType} granularity - Granularity of the data. e.g. `day`, `week`, `month`, `quarter`, `year`.
 *  @param {String} calculation - Calculation to apply on the data. e.g.
 *    `total`, `running_total`, `moving_average_3_periods`, `moving_average_7_periods`.
 *  @param groupUUID - UUID of the group.
 *  @param {object} queryOptions - Additional options for the query.
 */
const useEnterpriseEngagementData = ({
  enterpriseCustomerUUID,
  startDate,
  endDate,
  granularity = undefined,
  calculation = undefined,
  groupUUID = undefined,
  courseType = undefined,
  queryOptions = {},
}) => {
  const requestOptions = courseType === COURSE_TYPES.ALL_COURSE_TYPES
    ? { startDate, endDate, groupUUID }
    : {
      startDate, endDate, groupUUID, courseType,
    };
  const response = useQuery({
    queryKey: generateKey('engagements', enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchAdminAnalyticsData(
      enterpriseCustomerUUID,
      ANALYTICS_TABS.ENGAGEMENTS,
      requestOptions,
    ),
    staleTime: 0.5 * (1000 * 60 * 60), // 30 minutes. The time in milliseconds after data is considered stale.
    cacheTime: 0.75 * (1000 * 60 * 60), // 45 minutes. Cache data will be garbage collected after this duration.
    keepPreviousData: true,
    ...queryOptions,
  });

  return useMemo(() => applyDataTransformations(
    response,
    granularity,
    calculation,
  ), [response, granularity, calculation]);
};

export default useEnterpriseEngagementData;
