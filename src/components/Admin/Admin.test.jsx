import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter, Link } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import dayjs from 'dayjs';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import Admin from './index';
import { CSV_CLICK_SEGMENT_EVENT_NAME } from '../DownloadCsvButton';
import { useEnterpriseBudgets } from '../EnterpriseSubsidiesContext/data/hooks';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('../EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn().mockReturnValue({
    data: [],
  }),
}));

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
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
  enterpriseBudgets: {
    loading: null,
    budgets: null,
  },
  enterpriseGroups: {
    loading: null,
    groups: [],
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
          budgets={[{
            subsidy_access_policy_uuid: '8d6503dd-e40d-42b8-442b-37dd4c5450e3',
            subsidy_access_policy_display_name: 'Everything',
          }]}
          groups={[{
            enterprise_group_uuid: '7d6503dd-e40d-42b8-442b-37dd4c5450e3',
            enterprise_group_name: 'Test Group',
          }]}
          fetchDashboardInsights={() => {}}
          clearDashboardInsights={() => {}}
          fetchEnterpriseBudgets={() => {}}
          clearEnterpriseBudgets={() => {}}
          fetchEnterpriseGroups={() => {}}
          clearEnterpriseGroups={() => {}}
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
    budgets: [],
    groups: [],
  };

  describe('renders correctly', () => {
    it('calls fetchDashboardAnalytics prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const tree = renderer
        .create((
          <AdminWrapper
            fetchDashboardAnalytics={mockFetchDashboardAnalytics}
            enterpriseId="test-enterprise-id"
            loading
          />
        ))
        .toJSON();
      expect(mockFetchDashboardAnalytics).toHaveBeenCalled();
      expect(tree).toMatchSnapshot();
    });

    it('with no dashboard analytics data', () => {
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

    it('with no dashboard insights data', () => {
      const insights = null;
      const tree = renderer
        .create((
          <AdminWrapper
            {...baseProps}
            insights={insights}
          />
        ))
        .toJSON();

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
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              insights={insights}
            />
          ))
          .toJSON();

        expect(tree).toMatchSnapshot();
      });
    });

    describe('with enterprise budgets data', () => {
      it('renders budgets correctly', () => {
        const budgetUUID = '8d6503dd-e40d-42b8-442b-37dd4c5450e3';
        const budgets = [{
          subsidy_access_policy_uuid: budgetUUID,
          subsidy_access_policy_display_name: 'Everything',
        }];
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              budgets={budgets}
            />
          ))
          .toJSON();

        expect(tree).toMatchSnapshot();
      });
    });

    describe('with enterprise groups data', () => {
      it('renders groups correctly', () => {
        const groups = [{
          enterprise_group_uuid: 'test-group-uuid',
          enterprise_group_name: 'test-group-name',
        }];
        const tree = renderer
          .create((
            <AdminWrapper
              {...baseProps}
              groups={groups}
            />
          ))
          .toJSON();

        expect(tree).toMatchSnapshot();
      });
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
        const wrapper = mount((
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
        wrapper.find('.download-btn').hostNodes().simulate('click');
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
      const wrapper = mount((
        <AdminWrapper
          {...baseProps}
          location={
            { search: '' }
          }
        />
      ));
      expect(wrapper.text()).not.toContain('Reset Filters');
    });
    it('should not be present if only query is ordering', () => {
      const wrapper = mount((
        <AdminWrapper
          {...baseProps}
          location={
            { search: 'ordering=xyz' }
          }
        />
      ));
      expect(wrapper.text()).not.toContain('Reset Filters');
    });
    it('should not be present if query is null', () => {
      const wrapper = mount((
        <AdminWrapper
          {...baseProps}
          location={
            { search: null }
          }
        />
      ));
      expect(wrapper.text()).not.toContain('Reset Filters');
    });
    it('should be present if there is a querystring', () => {
      const path = '/lael/';
      const wrapper = mount((
        <AdminWrapper
          {...baseProps}
          location={
            { search: 'search=foo', pathname: path }
          }
        />
      ));
      expect(wrapper.text()).toContain('Reset Filters');
      const link = wrapper.find(Link).find('#reset-filters');
      expect(link.first().props().to).toEqual(path);
    });
    it('should be present if there is a querystring mixed with ordering', () => {
      const path = '/lael/';
      const nonSearchQuery = 'ordering=xyz';
      const wrapper = mount((
        <AdminWrapper
          {...baseProps}
          location={
            { search: `search=foo&${nonSearchQuery}`, pathname: path }
          }
        />
      ));
      expect(wrapper.text()).toContain('Reset Filters');
      const link = wrapper.find(Link).find('#reset-filters');
      expect(link.first().props().to).toEqual(`${path}?${nonSearchQuery}`);
    });
    it('should not disturb non-search-releated queries', () => {
      const path = '/lael/';
      const nonSearchQuery = 'features=bestfeature';
      const wrapper = mount((
        <AdminWrapper
          {...baseProps}
          location={
            { search: `search=foo&${nonSearchQuery}`, pathname: path }
          }
        />
      ));
      expect(wrapper.text()).toContain('Reset Filters');
      const link = wrapper.find(Link).find('#reset-filters');
      expect(link.first().props().to).toEqual(`${path}?${nonSearchQuery}`);
    });
  });

  describe('renders expiry component when threshold is met', () => {
    it('renders when date is within threshold', () => {
      useEnterpriseBudgets.mockReturnValue(
        {
          data: [
            {
              end: dayjs().add(60, 'day').toString(),
            },
          ],
        },
      );

      render(<AdminWrapper {...baseProps} />);

      expect(screen.getByTestId('expiry-notification-alert')).toBeInTheDocument();
    });

    it('does not render when date is not within threshold', () => {
      useEnterpriseBudgets.mockReturnValue(
        {
          data: [
            {
              end: dayjs().add(160, 'day').toString(),
            },
          ],
        },
      );

      render(<AdminWrapper {...baseProps} />);

      expect(screen.queryByTestId('expiry-notification-alert')).not.toBeInTheDocument();
    });
  });
});
