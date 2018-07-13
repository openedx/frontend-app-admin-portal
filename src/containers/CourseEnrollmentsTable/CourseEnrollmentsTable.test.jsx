import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';

import CourseEnrollmentsPage from './index';

const mockStore = configureMockStore([thunk]);

describe('CourseEnrollmentsPage', () => {
  let store;
  let wrapper;
  let dispatchSpy;

  beforeEach(() => {
    const initialState = {
      portalConfiguration: {
        enterpriseId: 'test-enterprise-id',
      },
      courseEnrollments: {
        enrollments: {
          count: 0,
          current_page: 1,
          num_pages: 0,
          next: null,
          previous: null,
          results: [],
          start: 0,
        },
      },
    };
    store = mockStore(initialState);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    wrapper = shallow((
      <CourseEnrollmentsPage store={store} />
    ));
  });

  it('sets the enrollments prop', () => {
    expect(wrapper.props().enrollments).toEqual({
      count: 0,
      current_page: 1,
      num_pages: 0,
      next: null,
      previous: null,
      results: [],
      start: 0,
    });
  });

  it('getCourseEnrollments dispatches fetchCourseEnrollments action', () => {
    wrapper.props().getCourseEnrollments('ee5e6b3a-069a-4947-bb8d-d2dbc323396c');
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
