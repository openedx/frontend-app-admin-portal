import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';

import CoursewarePage from './index';

const mockStore = configureMockStore([thunk]);

describe('CoursewarePage', () => {
  let store;
  let wrapper;
  let dispatchSpy;

  beforeEach(() => {
    const initialState = {
      courseOutline: {
        outline: {
          descendants: [],
          displayName: '',
        },
        unitNodeList: [],
      },
    };
    store = mockStore(initialState);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    const mockMatch = {
      params: {
        courseId: 'Course123',
      },
      url: 'http://www.test.com',
    };
    wrapper = shallow((
      <CoursewarePage store={store} match={mockMatch} />
    ));
  });

  it('sets the courseOutline prop', () => {
    expect(wrapper.props().courseOutline).toEqual({
      descendants: [],
      displayName: '',
    });
  });

  it('getCourseOutline dispatches fetchCourseOutline action', () => {
    wrapper.props().getCourseOutline('Test Course Id');
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
