import faker from 'faker/locale/en';
import courses from './courses';
import { coupons, codes } from './coupons';

const numEnrollments = 330;
const numPassed = 120;

const getEnrollments = () => {
  const fromPastWeekDate = new Date();
  const fromPastMonthDate = new Date();
  const toPastMonthDate = new Date();
  fromPastWeekDate.setDate(fromPastWeekDate.getDate() - 7);
  fromPastMonthDate.setDate(fromPastMonthDate.getDate() - 30);
  toPastMonthDate.setDate(toPastMonthDate.getDate() - 60);
  const dateInPastMonths = faker.date.between(fromPastMonthDate, toPastMonthDate);
  const dateInPastMonth = faker.date.between(fromPastWeekDate, fromPastMonthDate);

  let enrollmentsData = [...Array(numEnrollments)].map((_, idx) => {
    // Although we don't pass first & lastname, this makes our emails more consistent
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const provider = 'bestrun.com';

    const course = courses[faker.random.number({ max: courses.length - 1 })];
    const courseStart = faker.date.past();
    const courseEnd = faker.date.future();
    const hasPassed = idx < numPassed;
    const grade = hasPassed ? faker.random.number({ min: 70, max: 100 }) :
      faker.random.number({ max: 70 });
    const lastActivityDate = hasPassed ? faker.date.recent(7) : dateInPastMonths;

    return {
      id: idx,
      user_email: faker.internet.email(firstName, lastName, provider),
      consent_granted: true,
      course_title: course.title,
      course_price: course.price,
      course_start: courseStart,
      course_end: courseEnd,
      passed_timestamp: hasPassed ? faker.date.recent(7)
        : null,
      has_passed: hasPassed,
      current_grade: grade / 100,
      last_activity_date: lastActivityDate,
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
const completedEnrollments = enrollments.filter(enrollment => enrollment.has_passed === true);

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
  enrollment.course_end.getTime() < new Date().getTime()
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
  const lastActivityDate = new Date();
  if (filterOption === 'active_past_week') {
    lastActivityDate.setDate(lastActivityDate.getDate() - 7);
    filteredLearnerEnrollments = enrollments.filter(enrollment => (
      enrollment.last_activity_date.getTime() >= lastActivityDate.getTime()
    ));
  } else if (filterOption === 'inactive_past_week') {
    lastActivityDate.setDate(lastActivityDate.getDate() - 7);
    filteredLearnerEnrollments = enrollments.filter(enrollment => (
      enrollment.last_activity_date.getTime() <= lastActivityDate.getTime()
    ));
  } else if (filterOption === 'inactive_past_month') {
    lastActivityDate.setDate(lastActivityDate.getDate() - 30);
    filteredLearnerEnrollments = enrollments.filter(enrollment => (
      enrollment.last_activity_date.getTime() <= lastActivityDate.getTime()
    ));
  }
  return filteredLearnerEnrollments;
};

const filterPastWeekCompletions = () => {
  const today = new Date();
  const passedDateTime = new Date().setDate(today.getDate() - 7);
  return completedEnrollments.filter(enrollment => (
    enrollment.passed_timestamp.getTime() >= passedDateTime &&
    enrollment.passed_timestamp.getTime() <= today.getTime()
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
  last_updated_date: new Date().toString(),
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
};
