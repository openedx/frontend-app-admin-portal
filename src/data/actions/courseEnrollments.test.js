import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import qs from 'query-string';

import fetchCourseEnrollments from './courseEnrollments';
import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
} from '../constants/courseEnrollments';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
    axiosMock.restore();
  });

  describe('fetchCourseEnrollments', () => {
    it('fetches enrollments', () => {
      const enterpriseId = 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c';
      const responseData = {
        count: 3,
        num_pages: 1,
        current_page: 1,
        results: [
          {
            id: 2,
            enterprise_id: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
            enterprise_name: 'Enterprise 1',
            lms_user_id: 11,
            enterprise_user_id: 1,
            course_id: 'edx/Open_DemoX/edx_demo_course',
            enrollment_created_timestamp: '2014-06-27T16:02:38Z',
            course_title: 'All about testing!',
          },
        ],
      };

      const params = {
        page: 1,
        page_size: 10,
      };

      axiosMock.onGet(`http://localhost:8000/enterprise/api/v0/enterprise/${enterpriseId}/enrollments/?${qs.stringify(params)}`)
        .replyOnce(200, JSON.stringify(responseData));

      const expectedActions = [
        { type: FETCH_COURSE_ENROLLMENTS_REQUEST },
        { type: FETCH_COURSE_ENROLLMENTS_SUCCESS, payload: { enrollments: responseData } },
      ];
      const store = mockStore();

      return store.dispatch(fetchCourseEnrollments({ enterpriseId })).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
