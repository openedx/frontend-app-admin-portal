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

  const verifyFetchMethod = (fetchMethod, options = {}) => fetchMethod(options).then((results) => {
    // Only testing for data types, not actual values
    const expectedResults = {
      count: expect.any(Number),
      num_pages: expect.any(Number),
      current_page: expect.any(Number),
      results: expect.any(Array),
    };
    expect(results.data).toEqual(expectedResults);
  });

  beforeEach(() => {
    rewire();
  });

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

  it('rewires fetchCourseEnrollments call', () => verifyFetchMethod(EnterpriseDataApiService.fetchCourseEnrollments));

  it('rewires fetchCourseEnrollments with options call', () =>
    verifyFetchMethod(
      EnterpriseDataApiService.fetchCourseEnrollments,
      {
        learner_activity: 'active_past_week',
      },
    ));

  it('rewires fetchEnrolledLearners call', () => verifyFetchMethod(EnterpriseDataApiService.fetchEnrolledLearners));

  it('rewires filterEnrolledLearnersForInactiveCourses call', () => verifyFetchMethod(EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses));

  it('rewires fetchUnenrolledRegisteredLearners call', () => verifyFetchMethod(EnterpriseDataApiService.fetchUnenrolledRegisteredLearners));

  it('rewires fetchCompletedLearners call', () => verifyFetchMethod(EnterpriseDataApiService.fetchCompletedLearners));

  it('rewires fetchCourseEnrollmentsCsv call', () =>
    EnterpriseDataApiService.fetchCourseEnrollmentsCsv().then((results) => {
      expect(results.data).toEqual(expect.any(String));
    }));

  it('rewires fetchDashboardAnalytics', () =>
    EnterpriseDataApiService.fetchDashboardAnalytics().then((results) => {
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
    }));

  it('supports sorting via options', () =>
    EnterpriseDataApiService.fetchCourseEnrollments({ ordering: 'current_grade' }).then((results) => {
      let previous = results.data.results[0];
      results.data.results.forEach((enrollment) => {
        expect(enrollment.current_grade).toBeGreaterThanOrEqual(previous.current_grade);
        previous = enrollment;
      });
    }));

  it('supports pagination via options', () =>
    EnterpriseDataApiService.fetchCourseEnrollments({ page: 2 }).then((results) => {
      expect(results.data.current_page).toEqual(2);
    }));
});
