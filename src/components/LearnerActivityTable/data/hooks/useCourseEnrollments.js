import usePaginatedTableData from '../../../../hooks/usePaginatedTableData';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const useCourseEnrollments = (enterpriseId, tableId, apiFieldsForColumnAccessor, activity) => usePaginatedTableData({
  enterpriseId,
  tableId,
  apiFieldsForColumnAccessor,
  fetchFunctionOptions: {
    learnerActivity: activity,
  },
  fetchFunction: EnterpriseDataApiService.fetchCourseEnrollments,
});

export default useCourseEnrollments;
