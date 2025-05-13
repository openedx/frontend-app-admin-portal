import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import dayjs from 'dayjs';
import EnterpriseDataApiService from '../../../data/services/EnterpriseDataApiService';
import Admin from '../index';
import { CSV_CLICK_SEGMENT_EVENT_NAME } from '../../DownloadCsvButton';
import { useEnterpriseBudgets } from '../../EnterpriseSubsidiesContext/data/hooks';

const dndKitCore = require('@dnd-kit/core');
const dndKitSortable = require('@dnd-kit/sortable');

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => children,
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn().mockReturnValue([]),
}));

jest.mock('@dnd-kit/sortable', () => {
  const mockArrayMove = jest.fn().mockImplementation((items, oldIndex, newIndex) => {
    // Default implementation that can be overridden in specific tests
    if (oldIndex === 0 && newIndex === 1) {
      return ['learner-report', 'analytics-overview'];
    }
    return items;
  });

  return {
    arrayMove: mockArrayMove,
    SortableContext: ({ children }) => children,
    verticalListSortingStrategy: jest.fn(),
  };
});

jest.mock('../SortableItem', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('../../EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../../EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn().mockReturnValue({
    data: [],
  }),
}));

const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

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
          {...props}
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
      render(
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
          loading
        />,
      );
      expect(mockFetchDashboardAnalytics).toHaveBeenCalled();
      expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
      expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
    });

    describe('with dashboard analytics data', () => {
      it('renders full report', () => {
        render(<AdminWrapper {...baseProps} />);
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Full report')).toBeInTheDocument();
      });

      it('renders registered but not enrolled report', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="registered-unenrolled-learners"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Registered Learners Not Yet Enrolled in a Course')).toBeInTheDocument();
      });

      it('renders # courses enrolled by learners', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="enrolled-learners"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Number of Courses Enrolled by Learners')).toBeInTheDocument();
      });

      it('renders learners not enrolled in an active course', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="enrolled-learners-inactive-courses"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Learners Not Enrolled in an Active Course')).toBeInTheDocument();
      });

      it('renders top active learners', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="learners-active-week"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Learners Enrolled in a Course')).toBeInTheDocument();
        expect(screen.getByText('Top Active Learners')).toBeInTheDocument();
      });

      it('renders inactive learners past week', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="learners-inactive-week"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Learners Enrolled in a Course')).toBeInTheDocument();
        expect(screen.getByText('Not Active in Past Week')).toBeInTheDocument();
      });

      it('renders inactive learners past month', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="learners-inactive-month"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Learners Enrolled in a Course')).toBeInTheDocument();
        expect(screen.getByText('Not Active in Past Month')).toBeInTheDocument();
      });

      it('renders # of courses completed by learner', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="completed-learners"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Number of Courses Completed by Learner')).toBeInTheDocument();
      });

      it('renders # of courses completed by learner in past week', () => {
        render(
          <AdminWrapper
            {...baseProps}
            actionSlug="completed-learners-week"
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Number of Courses Completed by Learner')).toBeInTheDocument();
        expect(screen.getByText('Past Week')).toBeInTheDocument();
      });

      it('renders collapsible cards', () => {
        render(
          <AdminWrapper
            {...baseProps}
          />,
        );
        expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('Full report')).toBeInTheDocument();
        expect(screen.getByText('total number of learners registered')).toBeInTheDocument();
      });
    });

    it('with error state', () => {
      render(<AdminWrapper error={Error('Network Error')} />);

      expect(screen.getByText('Hey, nice to see you')).toBeInTheDocument();
      expect(screen.getByText(/Try refreshing your screen Network Error/)).toBeInTheDocument();
    });

    it('with loading state', () => {
      const { container } = render(<AdminWrapper loading />);

      expect(container.querySelector('main')).toHaveClass('learner-progress-report');
      expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
      expect(container.querySelector('.admin-cards-skeleton')).toBeInTheDocument();
    });

    it('with no dashboard insights data', () => {
      const { container } = render(<AdminWrapper {...baseProps} insights={null} />);

      expect(screen.getByRole('main')).toHaveClass('learner-progress-report');
      expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
      expect(container.querySelector('.number-cards')).not.toBeInTheDocument();
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

        render(<AdminWrapper {...baseProps} insights={insights} />);

        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(screen.getByText('total number of learners registered')).toBeInTheDocument();
      });

      it('renders skeleton when loading is true', () => {
        const { container } = render(<AdminWrapper {...baseProps} loading />);

        expect(container.querySelector('.admin-cards-skeleton')).toBeInTheDocument();
      });
    });

    describe('with enterprise budgets data', () => {
      it('renders budgets correctly', () => {
        const budgetUUID = '8d6503dd-e40d-42b8-442b-37dd4c5450e3';
        const budgets = [{
          subsidy_access_policy_uuid: budgetUUID,
          subsidy_access_policy_display_name: 'Everything',
        }];

        const { container } = render(<AdminWrapper {...baseProps} budgets={budgets} />);

        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(container.querySelector('.budgets-dropdown')).toBeInTheDocument();
      });
    });

    describe('with enterprise groups data', () => {
      it('renders groups correctly', () => {
        const groups = [{
          enterprise_group_uuid: 'test-group-uuid',
          enterprise_group_name: 'test-group-name',
        }];

        const { container } = render(<AdminWrapper {...baseProps} groups={groups} />);

        expect(screen.getByRole('heading', { name: 'Learner Progress Report' })).toBeInTheDocument();
        expect(container.querySelector('.groups-dropdown')).toBeInTheDocument();
      });
    });
  });

  describe('handle changes to enterpriseId prop', () => {
    it('handles non-empty change in enterpriseId prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const { rerender } = render(
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />,
      );

      rerender(<AdminWrapper
        fetchDashboardAnalytics={mockFetchDashboardAnalytics}
        enterpriseId="test-enterprise-id-2"
      />);
      expect(screen.getByTestId('learner-progress-report')).toHaveAttribute('data-enterprise-id', 'test-enterprise-id-2');
      expect(mockFetchDashboardAnalytics).toBeCalled();
    });

    it('handles empty change in enterpriseId prop', () => {
      const mockFetchDashboardAnalytics = jest.fn();
      const { rerender } = render(
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId="test-enterprise-id"
        />,
      );
      rerender(
        <AdminWrapper
          fetchDashboardAnalytics={mockFetchDashboardAnalytics}
          enterpriseId={null}
        />,
      );

      expect(screen.getByTestId('learner-progress-report')).not.toHaveAttribute('data-enterprise-id');
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

      it(key, async () => {
        spy = jest.spyOn(EnterpriseDataApiService, actionMetadata.csvFetchMethod);
        const user = userEvent.setup();
        render((
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
        const downloadButton = await screen.findByTestId('download-csv-btn');
        user.click(downloadButton);
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
    it('should not be present if there is no query', async () => {
      render(
        <AdminWrapper
          {...baseProps}
          location={
            { search: '' }
          }
        />,
      );
      const resetFilterComponent = await screen.queryByText('Reset Filters');
      expect(resetFilterComponent).not.toBeInTheDocument();
    });
    it('should not be present if only query is ordering', async () => {
      render(
        <AdminWrapper
          {...baseProps}
          location={
            { search: 'ordering=xyz' }
          }
        />,
      );
      const resetFilterComponent = await screen.queryByText('Reset Filters');
      expect(resetFilterComponent).not.toBeInTheDocument();
    });
    it('should not be present if query is null', async () => {
      render(
        <AdminWrapper
          {...baseProps}
          location={
            { search: null }
          }
        />,
      );
      const resetFilterComponent = await screen.queryByText('Reset Filters');
      expect(resetFilterComponent).not.toBeInTheDocument();
    });
    it('should be present if there is a querystring', async () => {
      const path = '/lael/';
      render((
        <AdminWrapper
          {...baseProps}
          location={
            { search: 'search=foo', pathname: path }
          }
        />
      ));
      const resetFilterComponent = await screen.queryByText('Reset Filters');
      expect(resetFilterComponent).toBeInTheDocument();
      expect(resetFilterComponent).toHaveAttribute('href', path);
    });
    it('should be present if there is a querystring mixed with ordering', async () => {
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
      const resetFilterComponent = await screen.queryByText('Reset Filters');
      expect(resetFilterComponent).toBeInTheDocument();
      expect(resetFilterComponent).toHaveAttribute('href', `${path}?${nonSearchQuery}`);
    });
    it('should not disturb non-search-releated queries', async () => {
      const path = '/lael/';
      const nonSearchQuery = 'features=bestfeature';
      render(
        <AdminWrapper
          {...baseProps}
          location={
            { search: `search=foo&${nonSearchQuery}`, pathname: path }
          }
        />,
      );
      const resetFilterComponent = await screen.queryByText('Reset Filters');
      expect(resetFilterComponent).toBeInTheDocument();
      expect(resetFilterComponent).toHaveAttribute('href', `${path}?${nonSearchQuery}`);
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

  describe('scroll to report section when fragment present', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('scrolls when fragment present', async () => {
      const { rerender } = render((
        <AdminWrapper
          {...baseProps}
          location={
            { hash: '#fullreport' }
          }
        />
      ));
      // Setting prop to trigger componentDidUpdate
      rerender(
        <AdminWrapper
          {...baseProps}
          location={
            { hash: '#fullreport' }
          }
          enterpriseId="forcing-change-to-trigger-scroll"
        />,
      );
      const fullReportComponent = await screen.findByText('Full report');
      expect(fullReportComponent).toBeInTheDocument();
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
    it('does not scroll when fragment absent', async () => {
      const { rerender } = render((
        <AdminWrapper
          {...baseProps}
          location={
            {}
          }
        />
      ));
      // Setting prop to trigger componentDidUpdate
      rerender(
        <AdminWrapper
          {...baseProps}
          location={
            {}
          }
          enterpriseId="forcing-change-to-trigger-scroll"
        />,
      );
      const fullReportComponent = await screen.findByText('Full report');
      expect(fullReportComponent).toBeInTheDocument();
      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });

  describe('handleDragEnd function', () => {
    beforeEach(() => {
      Storage.prototype.getItem = jest.fn().mockReturnValue(JSON.stringify(['analytics-overview', 'learner-report']));
      Storage.prototype.setItem = jest.fn();
      dndKitSortable.arrayMove.mockClear();
    });

    it('updates component order when items are dragged', () => {
      let capturedOnDragEnd;
      jest.spyOn(dndKitCore, 'DndContext').mockImplementation(({ children, onDragEnd }) => {
        capturedOnDragEnd = onDragEnd;
        return children;
      });

      render(<AdminWrapper {...baseProps} />);

      const mockDragEvent = {
        active: { id: 'analytics-overview' },
        over: { id: 'learner-report' },
      };

      capturedOnDragEnd(mockDragEvent);
      expect(dndKitSortable.arrayMove).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lpr-components-order',
        JSON.stringify(['learner-report', 'analytics-overview']),
      );
    });

    it('does not update component order when drag position stays the same', () => {
      localStorage.setItem.mockClear();

      let capturedOnDragEnd;
      jest.spyOn(dndKitCore, 'DndContext').mockImplementation(({ children, onDragEnd }) => {
        capturedOnDragEnd = onDragEnd;
        return children;
      });

      render(<AdminWrapper {...baseProps} />);
      const mockDragEvent = {
        active: { id: 'analytics-overview' },
        over: { id: 'analytics-overview' },
      };

      capturedOnDragEnd(mockDragEvent);
      expect(dndKitSortable.arrayMove).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
