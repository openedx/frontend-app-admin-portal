import usePaginatedTableData from '../../../../hooks/usePaginatedTableData';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const useCourseUsers = (enterpriseId, tableId, apiFieldsForColumnAccessor) => usePaginatedTableData({
  enterpriseId,
  tableId,
  apiFieldsForColumnAccessor,
  fetchFunction: EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses,
});

export default useCourseUsers;
