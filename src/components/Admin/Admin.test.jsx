import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import Admin from './index';

import { features } from '../../config';

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
        getDashboardAnalytics={() => {}}
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
    it('calls getDashboardAnalytics prop', () => {
      const mockGetDashboardAnalytics = jest.fn();
      const tree = renderer
        .create((
          <AdminWrapper
            getDashboardAnalytics={mockGetDashboardAnalytics}
            enterpriseId="test-enterprise-id"
          />
        ))
        .toJSON();
      expect(mockGetDashboardAnalytics).toHaveBeenCalled();
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
        features.DASHBOARD_V2 = true;
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
        features.DASHBOARD_V2 = false;
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
      const mockGetDashboardAnalytics = jest.fn();
      const wrapper = mount((
        <AdminWrapper
          getDashboardAnalytics={mockGetDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.setProps({
        enterpriseId: 'test-enterprise-id-2',
      });

      expect(wrapper.prop('enterpriseId')).toEqual('test-enterprise-id-2');
      expect(mockGetDashboardAnalytics).toBeCalled();
    });

    it('handles empty change in enterpriseId prop', () => {
      const mockGetDashboardAnalytics = jest.fn();
      const wrapper = mount((
        <AdminWrapper
          getDashboardAnalytics={mockGetDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.setProps({
        enterpriseId: null,
      });

      expect(wrapper.prop('enterpriseId')).toEqual(null);
      expect(mockGetDashboardAnalytics).toBeCalled();
    });
  });

  describe('calls download csv fetch method for table', () => {
    let spy;

    afterEach(() => {
      spy.mockRestore();
    });

    it('enrollments', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            enrollments: {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('registered unenrolled learners', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchUnenrolledRegisteredLearners');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'registered-unenrolled-learners': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'registered-unenrolled-learners',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('enrolled learners', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchEnrolledLearners');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'enrolled-learners': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'enrolled-learners',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('enrolled learners inactive courses', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchEnrolledLearnersForInactiveCourses');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'enrolled-learners-inactive-courses': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'enrolled-learners-inactive-courses',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('learners active week', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'learners-active-week': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'learners-active-week',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('learners inactive week', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'learners-inactive-week': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'learners-inactive-week',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('learners inactive month', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'learners-inactive-month': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'learners-inactive-month',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('completed learners', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchCompletedLearners');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'completed-learners': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'completed-learners',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('completed learners past week', () => {
      spy = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
      const wrapper = mount((
        <AdminWrapper
          enterpriseId="test-enterprise-id"
          table={{
            'completed-learners-week': {
              data: {
                results: [{ id: 1 }],
              },
            },
          }}
          match={{
            url: '/',
            params: {
              actionSlug: 'completed-learners-week',
            },
          }}
        />
      ));
      wrapper.find('.download-btn').simulate('click');
      expect(spy).toHaveBeenCalled();
    });
  });
});
