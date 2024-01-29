import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { fireEvent, render, screen } from '@testing-library/react';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import Admin from './index';
import { CSV_CLICK_SEGMENT_EVENT_NAME } from '../DownloadCsvButton';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

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
  dashboardInsights: {
    loading: null,
    insights: null,
  },
});

const AdminWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <Admin
          enterpriseId="test-enterprise"
          enterpriseSlug="test-enterprise"
          clearDashboardAnalytics={() => {}}
          fetchDashboardAnalytics={() => {}}
          fetchPortalConfiguration={() => {}}
          fetchCsv={() => {}}
          searchEnrollmentsList={() => {}}
          tableData={[
            {
              course_title: 'Bears 101',
              course_start: Date.now(),
            },
          ]}
          location={{
            pathname: '/',
          }}
          {...props}
          fetchDashboardInsights={() => {}}
          clearDashboardInsights={() => {}}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<Admin />', () => {
  const baseProps = {
    activeLearners: {
      past_week: 1,
      past_month: 1,
    },
    enrolledLearners: 1,
    courseCompletions: 1,
    lastUpdatedDate: '2018-07-31T23:14:35Z',
    numberOfUsers: 3,
    insights: null,
  };

  describe('renders correctly', () => {
    it('calls fetchDashboardAnalytics prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const { container: tree } = render(
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
          loading
        />,
      );
      expect(mockFetchDashboardAnalytics).toHaveBeenCalled();
      expect(tree).toMatchSnapshot();
    });

    it('with no dashboard analytics data', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const { container: tree } = render(
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />,
      );
      expect(mockFetchDashboardAnalytics).toHaveBeenCalled();
      expect(tree).toMatchSnapshot();
    });

    describe('with dashboard analytics data', () => {
      it('renders full report', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders registered but not enrolled report', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'registered-unenrolled-learners',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders # courses enrolled by learners', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'enrolled-learners',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders learners not enrolled in an active course', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'enrolled-learners-inactive-courses',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders top active learners', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'learners-active-week',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders inactive learners past week', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'learners-inactive-week',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders inactive learners past month', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'learners-inactive-month',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders # of courses completed by learner', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'completed-learners',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders # of courses completed by learner in past week', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {
                actionSlug: 'completed-learners-week',
              },
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });

      it('renders collapsible cards', () => {
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            match={{
              url: '/',
              params: {},
            }}
          />,
        );
        expect(tree).toMatchSnapshot();
      });
    });

    it('with error state', () => {
      const { container: tree } = render(
        <AdminWrapper error={Error('Network Error')} />,
      );
      expect(tree).toMatchSnapshot();
    });

    it('with loading state', () => {
      const { container: tree } = render(
        <AdminWrapper loading />,
      );
      expect(tree).toMatchSnapshot();
    });

    it('with no dashboard insights data', () => {
      const insights = null;
      const { container: tree } = render(
        <AdminWrapper
          {...baseProps}
          insights={insights}
        />,
      );

      expect(tree).toMatchSnapshot();
    });

    describe('with dashboard insights data', () => {
      it('renders dashboard insights data correctly', () => {
        const insights = {
          learner_progress: {
            enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
            enterprise_customer_name: 'Microsoft Corporation',
            active_subscription_plan: true,
            assigned_licenses: 0,
            activated_licenses: 0,
            assigned_licenses_percentage: 0.0,
            activated_licenses_percentage: 0.0,
            active_enrollments: 1026,
            at_risk_enrollment_less_than_one_hour: 26,
            at_risk_enrollment_end_date_soon: 15,
            at_risk_enrollment_dormant: 918,
            created_at: '2023-10-02T03:24:17Z',
          },
          learner_engagement: {
            enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
            enterprise_customer_name: 'Microsoft Corporation',
            enrolls: 49,
            enrolls_prior: 45,
            passed: 2,
            passed_prior: 0,
            engage: 67,
            engage_prior: 50,
            hours: 62,
            hours_prior: 49,
            contract_end_date: '2022-06-13T00:00:00Z',
            active_contract: false,
            created_at: '2023-10-02T03:24:40Z',
          },
        };
        const { container: tree } = render(
          <AdminWrapper
            {...baseProps}
            insights={insights}
          />,
        );

        expect(tree).toMatchSnapshot();
      });
    });
  });

  describe('handle changes to enterpriseId prop', () => {
    it('handles non-empty change in enterpriseId prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const wrapper = render((
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.rerender(<AdminWrapper
        fetchDashboardAnalytics={mockFetchDashboardAnalytics}
        enterpriseId="test-enterprise-id-2"
      />);

      expect(mockFetchDashboardAnalytics).toBeCalledWith('test-enterprise-id-2');
      expect(mockFetchDashboardAnalytics).toBeCalledTimes(2);
    });

    it('handles empty change in enterpriseId prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const wrapper = render((
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />
      ));

      wrapper.rerender(<AdminWrapper
        fetchDashboardAnalytics={mockFetchDashboardAnalytics}
        enterpriseId={null}
      />);

      expect(mockFetchDashboardAnalytics).toBeCalledTimes(1);
    });
  });

  describe('calls download csv fetch method for table', () => {
    let spy;
    const enterpriseId = 'test-enterprise-id';
    const actionSlugs = {
      enrollments: {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [enterpriseId, {}, { csv: true }],
      },
      'registered-unenrolled-learners': {
        csvFetchMethod: 'fetchUnenrolledRegisteredLearners',
        csvFetchParams: [enterpriseId, {}, { csv: true }],
      },
      'enrolled-learners': {
        csvFetchMethod: 'fetchEnrolledLearners',
        csvFetchParams: [enterpriseId, {}, { csv: true }],
      },
      'enrolled-learners-inactive-courses': {
        csvFetchMethod: 'fetchEnrolledLearnersForInactiveCourses',
        csvFetchParams: [enterpriseId, {}, { csv: true }],
      },
      'learners-active-week': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [enterpriseId, { learnerActivity: 'active_past_week' }, { csv: true }],
      },
      'learners-inactive-week': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [enterpriseId, { learnerActivity: 'inactive_past_week' }, { csv: true }],
      },
      'learners-inactive-month': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [enterpriseId, { learnerActivity: 'inactive_past_month' }, { csv: true }],
      },
      'completed-learners': {
        csvFetchMethod: 'fetchCompletedLearners',
        csvFetchParams: [enterpriseId, {}, { csv: true }],
      },
      'completed-learners-week': {
        csvFetchMethod: 'fetchCourseEnrollments',
        csvFetchParams: [enterpriseId, { passedDate: 'last_week' }, { csv: true }],
      },
    };

    afterEach(() => {
      spy.mockRestore();
    });

    Object.keys(actionSlugs).forEach((key) => {
      const actionMetadata = actionSlugs[key];

      it(key, () => {
        spy = jest.spyOn(EnterpriseDataApiService, actionMetadata.csvFetchMethod);
        const wrapper = render((
          <AdminWrapper
            {...baseProps}
            enterpriseId="test-enterprise-id"
            table={{
              [key]: {
                data: {
                  results: [{ id: 1 }],
                },
              },
            }}
            actionSlug={key}
            location={{
              pathname: '/',
            }}
          />
        ));
        fireEvent.click(wrapper.container.querySelector('.download-btn'));
        expect(spy).toHaveBeenCalledWith(...actionMetadata.csvFetchParams);
        expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
          enterpriseId,
          CSV_CLICK_SEGMENT_EVENT_NAME,
          { csvId: key },
        );
      });
    });
  });
  describe('reset form button', () => {
    it('should not be present if there is no query', () => {
      render((
        <AdminWrapper
          {...baseProps}
          location={
            { search: '' }
          }
        />
      ));
      expect(screen.queryByText('Reset Filters')).toBeFalsy();
    });
    it('should not be present if only query is ordering', () => {
      render((
        <AdminWrapper
          {...baseProps}
          location={
            { search: 'ordering=xyz' }
          }
        />
      ));
      expect(screen.queryByText('Reset Filters')).toBeFalsy();
    });
    it('should not be present if query is null', () => {
      render((
        <AdminWrapper
          {...baseProps}
          location={
            { search: null }
          }
        />
      ));
      expect(screen.queryByText('Reset Filters')).toBeFalsy();
    });
    it('should be present if there is a querystring', () => {
      const path = '/lael/';
      render((
        <AdminWrapper
          {...baseProps}
          location={
            { search: 'search=foo', pathname: path }
          }
        />
      ));
      const resetFilters = screen.getByText('Reset Filters');

      expect(resetFilters).toBeTruthy();
      expect(resetFilters.href).toContain(path);
    });
    it('should be present if there is a querystring mixed with ordering', () => {
      const path = '/lael/';
      const nonSearchQuery = 'ordering=xyz';
      render((
        <AdminWrapper
          {...baseProps}
          location={
            { search: `search=foo&${nonSearchQuery}`, pathname: path }
          }
        />
      ));
      const resetFilters = screen.getByText('Reset Filters');

      expect(resetFilters).toBeTruthy();
      expect(resetFilters.href).toContain(`${path}?${nonSearchQuery}`);
    });
    it('should not disturb non-search-releated queries', () => {
      const path = '/lael/';
      const nonSearchQuery = 'features=bestfeature';
      render((
        <AdminWrapper
          {...baseProps}
          location={
            { search: `search=foo&${nonSearchQuery}`, pathname: path }
          }
        />
      ));

      const resetFilters = screen.getByText('Reset Filters');

      expect(resetFilters).toBeTruthy();
      expect(resetFilters.href).toContain(`${path}?${nonSearchQuery}`);
    });
  });
});
