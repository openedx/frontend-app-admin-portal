import usePaginatedTableData from '../../../../hooks/usePaginatedTableData';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const useCourseEnrollments = (enterpriseId, tableId, apiFieldsForColumnAccessor) => usePaginatedTableData({
  enterpriseId,
  tableId,
  apiFieldsForColumnAccessor,
  fetchFunction: EnterpriseDataApiService.fetchCourseEnrollments,
});

export default useCourseEnrollments;
