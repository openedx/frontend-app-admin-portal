import usePaginatedTableData from '../../../../hooks/usePaginatedTableData';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const useCompletedLearners = (enterpriseId, tableId, apiFieldsForColumnAccessor) => usePaginatedTableData({
  enterpriseId,
  tableId,
  apiFieldsForColumnAccessor,
  fetchFunction: EnterpriseDataApiService.fetchCompletedLearners,
});

export default useCompletedLearners;
