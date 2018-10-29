import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import Admin from './index';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  table: {},
  csv: {},
  dashboardAnalytics: {
    active_learners: {
      past_month: 1,
      past_week: 1,
    },
    enrolled_learners: 1,
    number_of_users: 3,
    course_completions: 1,
  },
});

const AdminWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <Admin
        enterpriseId="test-enterprise"
        enterpriseSlug="test-enterprise"
        clearDashboardAnalytics={() => {}}
        fetchDashboardAnalytics={() => {}}
        fetchPortalConfiguration={() => {}}
        fetchCsv={() => {}}
        match={{
          params: {},
          url: '/',
        }}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

describe('<Admin />', () => {
  describe('renders correctly', () => {
    it('calls fetchDashboardAnalytics prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const tree = renderer
        .create((
          <AdminWrapper
            fetchDashboardAnalytics={mockFetchDashboardAnalytics}
            enterpriseId="test-enterprise-id"
          />
        ))
        .toJSON();
      expect(mockFetchDashboardAnalytics).toHaveBeenCalled();
      expect(tree).toMatchSnapshot();
    });

    describe('with dashboard analytics data', () => {
      const baseProps = {
        activeLearners: {
          past_week: 1,
          past_month: 1,
        },
        enrolledLearners: 1,
        courseCompletions: 1,
        lastUpdatedDate: '2018-07-31T23:14:35Z',
        numberOfUsers: 3,
      };

      it('renders full report', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders registered but not enrolled report', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'registered-unenrolled-learners',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders # courses enrolled by learners', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'enrolled-learners',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders learners not enrolled in an active course', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'enrolled-learners-inactive-courses',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders top active learners', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'learners-active-week',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders inactive learners past week', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'learners-inactive-week',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders inactive learners past month', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'learners-inactive-month',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders # of courses completed by learner', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'completed-learners',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders # of courses completed by learner in past week', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {
                  actionSlug: 'completed-learners-week',
                },
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });

      it('renders collapsible cards', () => {
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              match={{
                url: '/',
                params: {},
              }}
            />
          ))
          .toJSON();
        expect(tree).toMatchSnapshot();
      });
    });

    it('with error state', () => {
      const tree = renderer
        .create((
          <AdminWrapper error={Error('Network Error')} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with loading state', () => {
      const tree = renderer
        .create((
          <AdminWrapper loading />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('handle changes to enterpriseId prop', () => {
    it('handles non-empty change in enterpriseId prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const wrapper = mount((
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.setProps({
        enterpriseId: 'test-enterprise-id-2',
      });

      expect(wrapper.prop('enterpriseId')).toEqual('test-enterprise-id-2');
      expect(mockFetchDashboardAnalytics).toBeCalled();
    });

    it('handles empty change in enterpriseId prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const wrapper = mount((
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.setProps({
        enterpriseId: null,
      });

      expect(wrapper.prop('enterpriseId')).toEqual(null);
      expect(mockFetchDashboardAnalytics).toBeCalled();
    });
  });

  describe('calls download csv fetch method for table', () => {
    let spy;

    const actionSlugs = {
      enrollments: {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [{}, { csv: true }],
      },
      'registered-unenrolled-learners': {
        csvFetchMethod: 'fetchUnenrolledRegisteredLearners',
        csvFetchParams: [{}, { csv: true }],
      },
      'enrolled-learners': {
        csvFetchMethod: 'fetchEnrolledLearners',
        csvFetchParams: [{}, { csv: true }],
      },
      'enrolled-learners-inactive-courses': {
        csvFetchMethod: 'fetchEnrolledLearnersForInactiveCourses',
        csvFetchParams: [{}, { csv: true }],
      },
      'learners-active-week': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [{ learner_activity: 'active_past_week' }, { csv: true }],
      },
      'learners-inactive-week': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [{ learner_activity: 'inactive_past_week' }, { csv: true }],
      },
      'learners-inactive-month': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [{ learner_activity: 'inactive_past_month' }, { csv: true }],
      },
      'completed-learners': {
        csvFetchMethod: 'fetchCompletedLearners',
        csvFetchParams: [{}, { csv: true }],
      },
      'completed-learners-week': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [{ passed_date: 'last_week' }, { csv: true }],
      },
    };

    afterEach(() => {
      spy.mockRestore();
    });

    Object.keys(actionSlugs).forEach((key) => {
      const actionMetadata = actionSlugs[key];

      it(key, () => {
        spy = jest.spyOn(EnterpriseDataApiService, actionMetadata.csvFetchMethod);
        const wrapper = mount((
          <AdminWrapper
            enterpriseId="test-enterprise-id"
            table={{
              [key]: {
                data: {
                  results: [{ id: 1 }],
                },
              },
            }}
            match={{
              url: '/',
              params: {
                actionSlug: key !== 'enrollments' ? key : undefined,
              },
            }}
          />
        ));
        wrapper.find('.download-btn').simulate('click');
        expect(spy).toHaveBeenCalledWith(...actionMetadata.csvFetchParams);
      });
    });
  });
});
