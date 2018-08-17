import { enrollments, overview } from './data';
import courses from './courses';

describe('Demo enrollment data', () => {
  it('generates 330 fake enrollments', () => {
    expect(enrollments.length).toEqual(330);
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
    // We don't care much to test the actual data, just make sure something is defined
    const expectedOverview = {
      active_learners: expect.any(Object),
      course_completions: expect.any(Number),
      enrolled_learners: expect.any(Number),
      last_update_date: expect.any(Date),
      number_of_users: expect.any(Number),
    };

    expect(overview).toEqual(expectedOverview);
  });
});

