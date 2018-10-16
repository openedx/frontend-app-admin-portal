import EnterpriseDataApiService from '../../src/data/services/EnterpriseDataApiService';
import rewire from './rewireEnterpriseDataApiService';

describe('rewireEnterpriseDataApiService', () => {
  const {
    fetchCompletedLearners,
    fetchCourseEnrollments,
    fetchEnrolledLearners,
    fetchEnrolledLearnersForInactiveCourses,
    fetchUnenrolledRegisteredLearners,
    fetchCourseEnrollmentsCsv,
    fetchDashboardAnalytics,
  } = EnterpriseDataApiService;

  afterEach(() => {
    // rewire in the tests overrides the methods on EnterpriseDataApiService so we restore
    // them to their original method calls after each test. Ideally we would just save/restore
    // EnterpriseDataApiService but imports are considered read-only.
    EnterpriseDataApiService.fetchCompletedLearners = fetchCompletedLearners;
    EnterpriseDataApiService.fetchCourseEnrollments = fetchCourseEnrollments;
    EnterpriseDataApiService.fetchEnrolledLearners = fetchEnrolledLearners;
    EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses = fetchEnrolledLearnersForInactiveCourses; // eslint-disable-line max-len
    EnterpriseDataApiService.fetchUnenrolledRegisteredLearners = fetchUnenrolledRegisteredLearners;
    EnterpriseDataApiService.fetchCourseEnrollmentsCsv = fetchCourseEnrollmentsCsv;
    EnterpriseDataApiService.fetchDashboardAnalytics = fetchDashboardAnalytics;
  });

  describe('fetchEnrollments', () => {
    const verifyFetchMethodEnrollments = (fetchMethod, options = {}) => fetchMethod(options).then((results) => { // eslint-disable-line max-len
      // Only testing for data types, not actual values
      const expectedResults = {
        count: expect.any(Number),
        num_pages: expect.any(Number),
        current_page: expect.any(Number),
        results: expect.any(Array),
      };
      expect(results.data).toEqual(expectedResults);
    });
    it('rewires fetchCourseEnrollments call', () => {
      rewire();
      return verifyFetchMethodEnrollments(EnterpriseDataApiService.fetchCourseEnrollments);
    });
    it('rewires fetchCourseEnrollments with options call', () => {
      rewire();
      return verifyFetchMethodEnrollments(
        EnterpriseDataApiService.fetchCourseEnrollments,
        {
          learner_activity: 'active_past_week',
        },
      );
    });
    it('rewires fetchEnrolledLearners call', () => {
      rewire();
      return verifyFetchMethodEnrollments(EnterpriseDataApiService.fetchEnrolledLearners);
    });
    it('rewires filterEnrolledLearnersForInactiveCourses call', () => {
      rewire();
      return verifyFetchMethodEnrollments(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses); // eslint-disable-line max-len
    });
    it('rewires fetchUnenrolledRegisteredLearners call', () => {
      rewire();
      return verifyFetchMethodEnrollments(EnterpriseDataApiService.fetchUnenrolledRegisteredLearners); // eslint-disable-line max-len
    });
    it('rewires fetchCompletedLearners call', () => {
      rewire();
      return verifyFetchMethodEnrollments(EnterpriseDataApiService.fetchCompletedLearners);
    });
    it('supports sorting via options', () => {
      rewire();
      return EnterpriseDataApiService.fetchCourseEnrollments({ ordering: 'current_grade' }).then((results) => {
        let previous = results.data.results[0];
        results.data.results.forEach((enrollment) => {
          expect(enrollment.current_grade).toBeGreaterThanOrEqual(previous.current_grade);
          previous = enrollment;
        });
      });
    });
    it('supports pagination via options', () => {
      rewire();
      return EnterpriseDataApiService.fetchCourseEnrollments({ page: 2 }).then((results) => {
        expect(results.data.current_page).toEqual(2);
      });
    });
  });

  describe('fetchCourseEnrollmentsCsv', () => {
    it('rewires fetchCourseEnrollmentsCsv call', () => {
      rewire();
      return EnterpriseDataApiService.fetchCourseEnrollmentsCsv().then((results) => {
        expect(results.data).toEqual(expect.any(String));
      });
    });
  });

  describe('fetchDashboardAnalytics', () => {
    it('rewires fetchDashboardAnalytics', () => {
      rewire();
      return EnterpriseDataApiService.fetchDashboardAnalytics().then((results) => {
        const expectedResults = {
          active_learners: {
            past_month: expect.any(Number),
            past_week: expect.any(Number),
          },
          course_completions: expect.any(Number),
          enrolled_learners: expect.any(Number),
          last_updated_date: expect.any(String),
          number_of_users: expect.any(Number),
        };
        expect(results.data).toEqual(expectedResults);
      });
    });
  });
});
