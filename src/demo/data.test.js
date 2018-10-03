import {
  allEnrollments,
  enrollments,
  filterCompletedLearnerCourses,
  filteredEnrollments,
  filterEnrolledLearners,
  filterEnrolledLearnersForInactiveCourses,
  filterUnenrolledRegisteredLearners,
  getEnrollmentsCsv,
  overview,
} from './data';
import courses from './courses';

describe('Demo enrollment data', () => {
  it('generates 350 fake enrollments', () => {
    expect(allEnrollments.length).toEqual(350);
  });

  it('generates data for fake csv', () => {
    expect(getEnrollmentsCsv().length).not.toBeNull();
  });

  it('generates 345 registered fake enrollments', () => {
    expect(filterUnenrolledRegisteredLearners().length).toEqual(345);
  });

  it('generates 345 enrolled fake enrollments', () => {
    expect(filterEnrolledLearners().length).toEqual(345);
  });

  it('generates 5 enrolled learners for inactive courses fake enrollments', () => {
    expect(filterEnrolledLearnersForInactiveCourses().length).toEqual(5);
  });

  it('generates 125 active learners fake enrollments in past week', () => {
    expect(filteredEnrollments({
      learner_activity: 'active_past_week',
    }).length).toEqual(125);
  });

  it('generates 220 inactive learners fake enrollments in past week', () => {
    expect(filteredEnrollments({
      learner_activity: 'inactive_past_week',
    }).length).toEqual(220);
  });

  it('generates 215 inactive learners fake enrollments in past month', () => {
    expect(filteredEnrollments({
      learner_activity: 'inactive_past_month',
    }).length).toEqual(215);
  });

  it('generates 135 course completion fake enrollments', () => {
    expect(filterCompletedLearnerCourses().length).toEqual(135);
  });

  it('generates 130 course completion fake enrollment in past week', () => {
    expect(filteredEnrollments({
      passed_date: 'last_week',
    }).length).toEqual(130);
  });

  it('includes titles from the static courses list', () => {
    const enrollmentTitles = enrollments.reduce((acc, enrollment) =>
      acc.concat(enrollment.course_title), []);

    const demoTitles = courses.map(course => course.title);

    enrollmentTitles.forEach((enrollmentTitle) => {
      expect(demoTitles).toContain(enrollmentTitle);
    });
  });
});

describe('Demo overview data', () => {
  it('generates fake overview data', () => {
    const expectedOverview = {
      active_learners: {
        past_month: 130,
        past_week: 125,
      },
      course_completions: 135,
      enrolled_learners: 345,
      last_updated_date: expect.any(String),
      number_of_users: 350,
    };

    expect(overview).toEqual(expectedOverview);
  });
});

