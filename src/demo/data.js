import faker from 'faker/locale/en';
import courses from './courses';

const numEnrollments = 330;
const percentPassed = 0.70;
const percentActive = 0.35;

const enrollments = [...Array(numEnrollments)].map((_, idx) => {
  // Although we don't pass first & lastname, this makes our emails more consistent
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const provider = 'bestrun.com';

  const course = courses[faker.random.number({ max: courses.length - 1 })];
  const courseStart = faker.date.past();
  const courseEnd = faker.date.future(null, courseStart);
  const hasPassed = Math.random() <= percentPassed;
  const grade = hasPassed ? faker.random.number({ min: 70, max: 100 }) :
    faker.random.number({ max: 70 });

  // TODO: we could generate all columns so we could easily fake the csv call as well
  return {
    id: idx,
    user_email: faker.internet.email(firstName, lastName, provider),
    course_title: course.title,
    course_price: course.price,
    course_start: courseStart,
    course_end: courseEnd,
    passed_timestamp: Math.random() <= hasPassed ? faker.date.between(courseStart, courseEnd)
      : null,
    has_passed: hasPassed,
    current_grade: grade / 100,
    last_activity_date: faker.date.recent(Math.random() <= percentActive ? 7 : 45),
  };
});

const overview = {
  // We could derive this data from the enrollments but for now just using static data
  active_learners: {
    past_month: 111,
    past_week: 48,
  },
  course_completions: 85,
  enrolled_learners: 203,
  last_update_date: new Date(),
  number_of_users: 268,
};

export {
  enrollments,
  overview,
};
