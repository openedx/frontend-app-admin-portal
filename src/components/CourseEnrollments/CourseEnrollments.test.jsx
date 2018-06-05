import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import CourseEnrollments from './index';
import { mockCourseEnrollments } from './CourseEnrollments.mocks';

describe('<CourseEnrollments />', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount((
      <CourseEnrollments getCourseEnrollments={() => {}} />
    ));
  });

  it('renders correctly', () => {
    const tree = renderer
      .create((
        <MemoryRouter>
          <CourseEnrollments getCourseEnrollments={() => {}} enrollments={mockCourseEnrollments} />
        </MemoryRouter>))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('formatTimestamp return properly formatted date', () => {
    expect(wrapper.instance().formatTimestamp('2014-06-05T16:02:38Z')).toEqual('June 5, 2014');
  });

  describe('formatEnrollmentData', () => {
    it('handles empty enrollments data', () => {
      const actualData = [];
      const expectedData = [];
      expect(wrapper.instance().formatEnrollmentData(actualData)).toEqual(expectedData);
    });

    it('handles non-empty enrollments data', () => {
      const expectedData = [
        {
          ...mockCourseEnrollments.results[0],
          course_end: 'December 1, 2016',
          has_passed: 'Yes',
          passed_timestamp: 'May 9, 2017',
        },
        {
          ...mockCourseEnrollments.results[1],
          course_end: 'December 1, 2016',
          has_passed: 'No',
          passed_timestamp: 'May 9, 2017',
        },
      ];
      expect((
        wrapper.instance().formatEnrollmentData(mockCourseEnrollments.results)
      )).toEqual(expectedData);
    });
  });
});
