import usePaginatedTableData from '../../../../hooks/usePaginatedTableData';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const useRegisteredLearners = (enterpriseId, tableId, apiFieldsForColumnAccessor) => usePaginatedTableData({
  enterpriseId,
  tableId,
  apiFieldsForColumnAccessor,
  fetchFunction: EnterpriseDataApiService.fetchUnenrolledRegisteredLearners,
});

export default useRegisteredLearners;
