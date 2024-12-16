import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { useMemo } from 'react';
import { ANALYTICS_TABS, generateKey } from '../constants';
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
  const modifiedResponse = _.cloneDeep(response);
  if (modifiedResponse?.data?.enrollmentsOverTime) {
    let enrollmentsOverTime = [];
    for (let i = 0; i < allowedEnrollTypes.length; i++) {
      const data = applyGranularity(
        modifiedResponse.data.enrollmentsOverTime.filter(
          enrollment => enrollment.enrollType === allowedEnrollTypes[i],
        ),
        'enterpriseEnrollmentDate',
        'enrollmentCount',
        granularity,
      );
      enrollmentsOverTime = enrollmentsOverTime.concat(
        applyCalculation(data, 'enrollmentCount', calculation),
      );
    }

    modifiedResponse.data.enrollmentsOverTime = enrollmentsOverTime;
  }

  return modifiedResponse;
};

/**
  Fetches enterprise enrollments data.

 *  @param {String} enterpriseCustomerUUID - UUID of the enterprise customer.
 *  @param {Date} startDate - Start date for the data.
 *  @param {Date} endDate - End date for the data.
 *  @param {OpUnitType} granularity - Granularity of the data. e.g. `day`, `week`, `month`, `quarter`, `year`.
 *  @param {String} calculation - Calculation to apply on the data. e.g.
 *    `total`, `running_total`, `moving_average_3_periods`, `moving_average_7_periods`.
 *  @param {Number} currentPage - Current page number.
 *  @param {Number} pageSize - Number of items per page.
 *  @param {object} queryOptions - Additional options for the query.
 */
const useEnterpriseEnrollmentsData = ({
  enterpriseCustomerUUID,
  startDate,
  endDate,
  granularity = undefined,
  calculation = undefined,
  currentPage = undefined,
  pageSize = undefined,
  queryOptions = {},
}) => {
  const requestOptions = {
    startDate, endDate, page: currentPage, pageSize,
  };
  const response = useQuery({
    queryKey: generateKey('enrollments', enterpriseCustomerUUID, requestOptions),
    queryFn: () => EnterpriseDataApiService.fetchAdminAnalyticsData(
      enterpriseCustomerUUID,
      ANALYTICS_TABS.ENROLLMENTS,
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

export default useEnterpriseEnrollmentsData;
