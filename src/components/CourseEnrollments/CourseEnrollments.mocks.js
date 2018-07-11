const generateCourseEnrollments = () => {
  const enrollments = [];

  for (let i = 1; i <= 30; i += 1) {
    enrollments.push({
      id: i,
      enterprise_id: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
      enterprise_name: 'Enterprise 1',
      lms_user_id: 11,
      enterprise_user_id: 1,
      course_id: 'edX/Open_DemoX/edx_demo_course',
      enrollment_created_timestamp: '2014-06-27T16:02:38Z',
      user_current_enrollment_mode: 'verified',
      consent_granted: true,
      letter_grade: 'Pass',
      has_passed: 1,
      passed_timestamp: '2017-05-09T16:27:34.690065Z',
      enterprise_sso_uid: 'harry',
      enterprise_site_id: null,
      course_title: 'All about acceptance testing!',
      course_start: '2016-09-01T16:00:00Z',
      course_end: '2016-12-01T16:00:00Z',
      course_pacing_type: 'instructor_paced',
      course_duration_weeks: '8',
      course_min_effort: 2,
      course_max_effort: 4,
      user_account_creation_timestamp: '2015-02-12T23:14:35Z',
      user_email: 'test@example.com',
      user_username: 'test_user',
      course_key: 'edX/Open_DemoX',
      user_country_code: 'US',
      last_activity_date: '2017-06-23',
      coupon_name: 'Enterprise Entitlement Coupon',
      coupon_code: 'PIPNJSUK33P7PTZH',
      final_grade: 0.80,
      course_price: 200.00,
      discount_price: 120.00,
    });
  }
  enrollments[1] = {
    ...enrollments[1],
    has_passed: 0,
    passed_timestamp: null,
    letter_grade: null,
    last_activity_date: null,
  };
  return enrollments;
};

const mockCourseEnrollments = {
  count: 30,
  current_page: 1,
  num_pages: 2,
  next: 'next_page_url',
  previous: null,
  results: generateCourseEnrollments(),
  start: 0,
};

export default mockCourseEnrollments;
