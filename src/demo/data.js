import faker from 'faker/locale/en';
import moment from 'moment';

import courses from './courses';
import { coupons, codes, codesCsv } from './coupons';

const numEnrollments = 330;
const numPassed = 120;

const getEnrollments = () => {
  const fromPastWeekDate = moment().subtract(1, 'week');
  const fromPastMonthDate = moment().subtract(1, 'month');
  const toPastMonthDate = moment().subtract(2, 'months');
  const dateInPastMonths = faker.date.between(fromPastMonthDate, toPastMonthDate);
  const dateInPastMonth = faker.date.between(fromPastWeekDate, fromPastMonthDate);

  let enrollmentsData = [...Array(numEnrollments)].map((_, index) => {
    // Although we don't pass first & lastname, this makes our emails more consistent
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const provider = 'bestrun.com';

    const course = courses[faker.random.number({ max: courses.length - 1 })];
    const courseStart = faker.date.past();
    const courseEnd = faker.date.future();
    const progressStatus = index < numPassed ? 'Passed' : 'Failed';
    const grade = progressStatus === 'Passed' ? faker.random.number({ min: 70, max: 100 }) :
      faker.random.number({ max: 70 });
    const lastActivityDate = progressStatus === 'Passed' ? faker.date.recent(7) : dateInPastMonths;
    const passedTimestamp = progressStatus === 'Passed' ? faker.date.recent(7) : null;

    return {
      id: index,
      user_email: faker.internet.email(firstName, lastName, provider),
      consent_granted: true,
      course_title: course.title,
      course_price: course.price,
      course_start: courseStart.toISOString(),
      course_end: courseEnd.toISOString(),
      passed_timestamp: passedTimestamp && passedTimestamp.toISOString(),
      progress_status: progressStatus,
      current_grade: grade / 100,
      last_activity_date: lastActivityDate && lastActivityDate.toISOString(),
    };
  });

  // Add more records to generate data for different tables.
  const enrollmentsSample = enrollmentsData.slice(0, 5);
  enrollmentsData = [
    ...enrollmentsData,
    ...enrollmentsSample.map(enrollment => ({
      ...enrollment,
      last_activity_date: dateInPastMonth,
    })),
    ...enrollmentsSample.map(enrollment => ({
      ...enrollment,
      consent_granted: false,
    })),
    ...enrollmentsSample.map(enrollment => ({
      ...enrollment,
      passed_timestamp: dateInPastMonths,
      last_activity_date: dateInPastMonths,
    })),
    ...enrollmentsSample.map(enrollment => ({
      ...enrollment,
      course_end: dateInPastMonth,
    })),
  ];
  return enrollmentsData;
};

const allEnrollments = getEnrollments();
const enrollments = allEnrollments.filter(enrollment => enrollment.consent_granted === true);
const completedEnrollments = enrollments.filter(enrollment => enrollment.progress_status === 'Passed');

const getEnrollmentsForUser = email => (
  enrollments.filter(enrollment => enrollment.user_email === email)
);

const getCompletedEnrollmentsForUser = email => (
  completedEnrollments.filter(enrollment => enrollment.user_email === email)
);

const filterEnrolledLearners = () => enrollments.map(enrollment => ({
  user_email: enrollment.user_email,
  user_account_creation_timestamp: faker.date.past(),
  enrollment_count: getEnrollmentsForUser(enrollment.user_email).length,
}));

const filterEnrolledLearnersForInactiveCourses = () => enrollments.filter(enrollment => (
  moment(enrollment.course_end) < moment()
)).map(enrollment => ({
  user_email: enrollment.user_email,
  enrollment_count: getEnrollmentsForUser(enrollment.user_email).length,
  course_completion_count: getCompletedEnrollmentsForUser(enrollment.user_email).length,
  last_activity_date: enrollment.last_activity_date,
}));

const filterUnenrolledRegisteredLearners = () => enrollments.map(enrollment => ({
  user_email: enrollment.user_email,
  user_account_creation_timestamp: faker.date.past(),
}));

const filterLearnerActivity = (filterOption) => {
  let filteredLearnerEnrollments = enrollments;
  let lastActivityDate = moment();
  if (filterOption === 'active_past_week') {
    lastActivityDate = lastActivityDate.subtract(1, 'week');
    filteredLearnerEnrollments = enrollments.filter(enrollment => (
      moment(enrollment.last_activity_date) >= lastActivityDate
    ));
  } else if (filterOption === 'inactive_past_week') {
    lastActivityDate = lastActivityDate.subtract(1, 'week');
    filteredLearnerEnrollments = enrollments.filter(enrollment => (
      moment(enrollment.last_activity_date) <= lastActivityDate
    ));
  } else if (filterOption === 'inactive_past_month') {
    lastActivityDate = lastActivityDate.subtract(1, 'month');
    filteredLearnerEnrollments = enrollments.filter(enrollment => (
      moment(enrollment.last_activity_date) <= lastActivityDate
    ));
  }
  return filteredLearnerEnrollments;
};

const filterPastWeekCompletions = () => {
  const pastWeekDate = moment().subtract(1, 'week');
  return completedEnrollments.filter(enrollment => (
    moment(enrollment.passed_timestamp) >= pastWeekDate
  ));
};

const filterCompletedLearnerCourses = () => completedEnrollments.map(enrollment => ({
  user_email: enrollment.user_email,
  completed_courses: getEnrollmentsForUser(enrollment.user_email).length,
}));

const filteredEnrollments = (options) => {
  let filterEnrollments = enrollments;
  if (options.learner_activity) {
    filterEnrollments = filterLearnerActivity(options.learner_activity);
  }
  if (options.passed_date) {
    filterEnrollments = filterPastWeekCompletions();
  }
  if (options.has_enrollments && options.extra_fields === 'enrollment_count') {
    filterEnrollments = filterEnrolledLearners();
  }
  return filterEnrollments;
};

const overview = {
  active_learners: {
    past_month: filterPastWeekCompletions().length,
    past_week: filterLearnerActivity('active_past_week').length,
  },
  course_completions: filterCompletedLearnerCourses().length,
  enrolled_learners: filterEnrolledLearners().length,
  last_updated_date: moment().toISOString(),
  number_of_users: allEnrollments.length,
};

const getEnrollmentsCsv = () => enrollments.reduce((csvData, enrollment) => (
  `${csvData}${Object.values(enrollment).toString()}\n`
), `${Object.keys(enrollments[0]).toString()}\n`);

export {
  allEnrollments,
  enrollments,
  filterCompletedLearnerCourses,
  filteredEnrollments,
  filterEnrolledLearners,
  filterEnrolledLearnersForInactiveCourses,
  filterUnenrolledRegisteredLearners,
  getEnrollmentsCsv,
  overview,
  coupons,
  codes,
  codesCsv,
};
