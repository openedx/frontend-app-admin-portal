import { useCallback, useMemo, useState } from "react";
import { logError } from "@edx/frontend-platform/logging";
import debounce from "lodash.debounce";
import omit from 'lodash/omit';

import EcommerceApiService from "../../../../data/services/EcommerceApiService";
import { cleanUndefinedKeys } from "../../../../utils";

const useCouponCodes = (couponId, selectedToggle) => {
  const [responseData, setResponseData] = useState({});
  const [lastSearchOptions, setLastSearchOptions] = useState('{}');

  const fetchCouponCodes = useCallback(
    (options) => {
      const fetch = async () => {
        try {
          // API uses 1-based page number while DataTable passes in 0-based page number
          const page = options.pageIndex + 1;
          const page_size = options.pageSize;
          const apiOptions = {
            ...cleanUndefinedKeys(omit(options, ['pageIndex', 'pageSize'])),
            code_filter: selectedToggle,
            page,
            page_size,
          };

          const response = await EcommerceApiService.fetchCouponDetails(
            couponId,
            apiOptions
          );
          setResponseData(response.data);
          const lastSearchOptions = apiOptions.toString();
          setLastSearchOptions(lastSearchOptions);
        } catch (error) {
          logError(error);
        } 
      };
      if (couponId) {
        fetch();
      }
    },
    [couponId, selectedToggle]
  );

  const debouncedFetchCouponCodes = useMemo(
    () => debounce(fetchCouponCodes, 300),
    [lastSearchOptions, selectedToggle]
  );

  return {
    couponCodes: responseData.results,
    count: responseData.count,
    numPages: responseData.num_pages,
    fetchCouponCodes: debouncedFetchCouponCodes,
  };
};

export default useCouponCodes;
