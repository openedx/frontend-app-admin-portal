import EnterpriseDataApiService from '../../src/data/services/EnterpriseDataApiService';
import rewire from './rewireEnterpriseDataApiService';

describe('rewireEnterpriseDataApiService', () => {
  const { fetchCourseEnrollments, fetchDashboardAnalytics } = EnterpriseDataApiService;

  afterEach(() => {
    // rewire in the tests overrides the methods on EnterpriseDataApiService so we restore
    // them to their original method calls after each test. Ideally we would just save/restore
    // EnterpriseDataApiService but imports are considered read-only.
    EnterpriseDataApiService.fetchCourseEnrollments = fetchCourseEnrollments;
    EnterpriseDataApiService.fetchDashboardAnalytics = fetchDashboardAnalytics;
  });

  it('rewires fetchCourseEnrollments call', () => {
    rewire();
    return EnterpriseDataApiService.fetchCourseEnrollments('test-enterprise-id', {}).then((results) => {
      // Only testing for data types, not actual values
      const expectedResults = {
        count: expect.any(Number),
        num_pages: expect.any(Number),
        current_page: expect.any(Number),
        results: expect.any(Array),
      };
      expect(results.data).toEqual(expectedResults);
    });
  });
});
