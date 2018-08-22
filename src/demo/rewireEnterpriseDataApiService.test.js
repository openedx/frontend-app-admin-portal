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

  describe('fetchCourseEnrollments', () => {
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
    it('supports sorting via options', () => {
      rewire();
      return EnterpriseDataApiService.fetchCourseEnrollments('test-enterprise-id', { ordering: 'current_grade' }).then((results) => {
        let previous = results.data.results[0];
        results.data.results.forEach((enrollment) => {
          expect(enrollment.current_grade).toBeGreaterThanOrEqual(previous.current_grade);
          previous = enrollment;
        });
      });
    });
    it('supports pagination via options', () => {
      rewire();
      return EnterpriseDataApiService.fetchCourseEnrollments('test-enterprise-id', { page: 2 }).then((results) => {
        expect(results.data.current_page).toEqual(2);
      });
    });
  });

  describe('fetchDashboardAnalytics', () => {
    rewire();
    return EnterpriseDataApiService.fetchDashboardAnalytics().then((results) => {
      const expectedResults = {
        active_learners: {
          past_month: expect.any(Number),
          past_week: expect.any(Number),
        },
        course_completions: expect.any(Number),
        enrolled_learners: expect.any(Number),
        last_update_date: expect.any(Date),
        number_of_users: expect.any(Number),
      };
      expect(results.data).toEqual(expectedResults);
    });
  });
});
