import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import { Pagination } from '@edx/paragon';

import { CourseEnrollments } from './index';
import {
  mockCourseEnrollments,
  COURSE_ENROLLMENTS_COUNT,
} from './CourseEnrollments.mocks';

const CourseEnrollmentsWrapper = props => (
  <MemoryRouter>
    <CourseEnrollments
      getCourseEnrollments={() => {}}
      {...props}
    />
  </MemoryRouter>
);

describe('<CourseEnrollments />', () => {
  let wrapper;

  describe('renders correctly', () => {
    it('calls getCourseEnrollments prop', () => {
      const getCourseEnrollmentsMock = jest.fn();
      mount((
        CourseEnrollmentsWrapper({
          getCourseEnrollments: getCourseEnrollmentsMock,
        })
      ));
      expect(getCourseEnrollmentsMock).toHaveBeenCalled();
    });

    it('with enrollment data', () => {
      const tree = renderer
        .create((
          CourseEnrollmentsWrapper({
            enrollments: mockCourseEnrollments,
          })
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with error state', () => {
      const tree = renderer
        .create((
          CourseEnrollmentsWrapper({
            error: Error('Network Error'),
          })
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with loading state', () => {
      const tree = renderer
        .create((
          CourseEnrollmentsWrapper({
            loading: true,
          })
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('formatEnrollmentData', () => {
    const expectedData = [{
      ...mockCourseEnrollments.results[0],
      course_start: 'September 1, 2016',
      course_end: 'December 1, 2016',
      has_passed: 'Yes',
      last_activity_date: 'June 23, 2017',
      passed_timestamp: 'May 9, 2017',
      enrollment_created_timestamp: 'June 27, 2014',
      user_account_creation_timestamp: 'February 12, 2015',
    }, {
      ...mockCourseEnrollments.results[1],
      course_start: 'September 1, 2016',
      course_end: 'December 1, 2016',
      has_passed: 'No',
      last_activity_date: 'June 23, 2017',
      passed_timestamp: null,
      enrollment_created_timestamp: 'June 27, 2014',
      user_account_creation_timestamp: 'February 12, 2015',
    }];

    beforeEach(() => {
      wrapper = shallow((
        <MemoryRouter>
          <CourseEnrollments
            getCourseEnrollments={() => {}}
            enrollments={mockCourseEnrollments}
          />
        </MemoryRouter>
      )).find(CourseEnrollments);
    });

    it('handles empty enrollments data', () => {
      wrapper.dive().setProps({
        enrollments: {},
      }, () => {
        expect(wrapper.dive().state('enrollments')).toHaveLength(0);
      });
    });

    it('handles non-empty enrollments data', () => {
      const enrollmentsData = wrapper.dive().state('enrollments');

      expect(enrollmentsData).toHaveLength(COURSE_ENROLLMENTS_COUNT);
      expect(enrollmentsData[0]).toEqual(expectedData[0]);
      expect(enrollmentsData[1]).toEqual(expectedData[1]);
    });

    it('does not override state enrollments when props enrollments changes with existing enrollments', () => {
      const currentEnrollments = wrapper.dive().state('enrollments');
      expect(currentEnrollments[0]).toEqual(expectedData[0]);
      expect(currentEnrollments[1]).toEqual(expectedData[1]);

      wrapper.dive().setProps({
        enrollments: mockCourseEnrollments,
      }, () => {
        const updatedEnrollments = wrapper.dive().state('enrollments');
        expect(updatedEnrollments[0]).toEqual(expectedData[0]);
        expect(updatedEnrollments[1]).toEqual(expectedData[1]);
      });
    });
  });

  it('handles pagination correctly', () => {
    const mockHistoryPush = jest.fn();
    wrapper = mount((
      <CourseEnrollments
        getCourseEnrollments={() => {}}
        enrollments={mockCourseEnrollments}
        history={{ push: mockHistoryPush }}
      />
    ));

    const pagination = wrapper.find(CourseEnrollments).find(Pagination);
    pagination.find('button').last().simulate('click'); // click `Next` button
    expect(mockHistoryPush).toHaveBeenCalledWith('?page=2');
    expect(wrapper.find('CourseEnrollments').instance().state.currentPage).toEqual(2);
  });
});
