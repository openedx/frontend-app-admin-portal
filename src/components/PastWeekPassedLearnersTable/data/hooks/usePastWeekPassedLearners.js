import usePaginatedTableData from '../../../../hooks/usePaginatedTableData';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const usePastWeekPassedLearners = (enterpriseId, tableId, apiFieldsForColumnAccessor) => usePaginatedTableData({
  enterpriseId,
  tableId,
  apiFieldsForColumnAccessor,
  fetchFunction: EnterpriseDataApiService.fetchCourseEnrollments,
  fetchFunctionOptions: {
    passedDate: 'last_week',
  },
});

export default usePastWeekPassedLearners;
