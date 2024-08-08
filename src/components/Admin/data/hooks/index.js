import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const useModuleActivityReport = ({
  enterpriseId, page, filters,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paginationData, setPaginationData] = useState({
    itemCount: 0,
    pageCount: 0,
    data: [],
  });

  useEffect(() => {
    // Reset the loading state
    setIsLoading(true);

    EnterpriseDataApiService.fetchEnterpriseModuleActivityReport(enterpriseId, {
      page: page + 1,
      ...filters,
    })
      .then((response) => {
        setPaginationData({
          itemCount: response.data.count,
          pageCount: response.data.num_pages,
          data: response.data.results,
          currentPage: response.data.currentPage,
        });

        // Reset the loading state
        setIsLoading(false);
      })
      .catch((err) => {
        logError(err);
        setError(err);

        // Reset the loading state
        setIsLoading(false);
      });
  }, [
    enterpriseId,
    page,
    filters,
  ]);

  return {
    isLoading,
    error,
    paginationData,
  };
};

export default useModuleActivityReport;
