import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';

import {
  useEnterpriseGroupUuid,
  useEnterpriseGroupMemberships,
  useLearnerProfileView,
  useLearnerCreditPlans,
} from '../data/hooks';
import LearnerDetailPage from '../LearnerDetailPage/LearnerDetailPage';
import LmsApiService from '../../../data/services/LmsApiService';
import { queryClient } from '../../test/testUtils';

const ENTERPRISE_ID = 'test-enterprise-id';
const ENTERPRISE_SLUG = 'test-slug';
const LMS_USER_ID = '4123';
const TEST_GROUP = {
  name: 'coolest people',
  uuid: '1276',
  acceptedMembersCount: 0,
  groupType: 'flex',
};

const TEST_GROUPS = [
  {
    groupUuid: TEST_GROUP.uuid,
    groupName: TEST_GROUP.name,
    recentAction: 'Accepted: March 10, 2025',
  }, {
    groupUuid: '6721',
    groupName: 'Another Group',
    recentAction: 'Removed: March 17, 2025',
  },
];

const mockProfileData = {
  data: {
    subscriptions: [
      {
        uuid: 'sub-1',
        subscriptionPlan: {
          planType: 'Subscription',
          title: 'Test Subscription Plan',
          uuid: 'sub-1',
        },
      },
    ],
    groupMemberships: [],
    enrollments: {
      inProgress: [
        {
          courseRunStatus: 'in_progress',
          startDate: '2023-09-01T10:00:00Z',
          endDate: '2024-08-31T10:00:00Z',
          displayName: 'Individualism and Identity in Severance',
          orgName: 'edx',
          courseKey: 'edx+Severance_101',
          courseType: 'verified-audit',
          enrollBy: '2024-08-21T23:59:59Z',
        },
      ],
      upcoming: [],
      completed: [
        {
          courseRunStatus: 'completed',
          startDate: '2023-09-01T10:00:00Z',
          endDate: '2024-08-31T10:00:00Z',
          displayName: 'The Corruptive Nature of Wealth in White Lotus',
          orgName: 'edx',
          courseKey: 'edx+WhtLotus_101',
          courseType: 'verified-audit',
          enrollBy: '2024-08-21T23:59:59Z',
        },
      ],
      savedForLater: [],
    },
  },
};

const TEST_ENTERPRISE_USER = {
  data: {
    results: [{
      enterprise_customer_user: {
        user_id: 1234,
        email: 'artdonaldson@atp.com',
        joined_org: 'Jun 30, 2023',
        name: 'Art Donaldson',
      },
      enrollments: 0,
    },
    ],
  },
};

const mockCreditPlansData = [
  {
    uuid: 'credit-1',
    displayName: 'Test Credit Plan',
    active: true,
    policyType: 'AssignedLearnerCreditAccessPolicy',
    planType: 'Credit',
  },
];

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: ENTERPRISE_ID,
    enterpriseFeatures: {
      adminPortalLearnerProfileViewEnabled: true,
    },
  },
};

jest.mock('../../../data/services/LmsApiService');
jest.mock('../../../data/services/EnterpriseAccessApiService');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useEnterpriseGroupMemberships: jest.fn(),
  useEnterpriseGroupUuid: jest.fn(),
  useLearnerProfileView: jest.fn(),
  useLearnerCreditPlans: jest.fn(),
}));

const LearnerDetailPageWrapper = ({
  initialState = initialStoreState,
}) => {
  const store = getMockStore({ ...initialState });
  return (
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <BrowserRouter>
          <Provider store={store}>
            <IntlProvider locale="en">
              <LearnerDetailPage />
            </IntlProvider>
          </Provider>
        </BrowserRouter>
      </IntlProvider>
    </QueryClientProvider>
  );
};

describe('LearnerDetailPage', () => {
  beforeEach(() => {
    useEnterpriseGroupUuid.mockReturnValue({ data: TEST_GROUP });
    useEnterpriseGroupMemberships.mockReturnValue({
      data: {
        data: {
          results: TEST_GROUPS,
        },
      },
    });
    LmsApiService.fetchEnterpriseCustomerMembers.mockResolvedValue(TEST_ENTERPRISE_USER);
    useLearnerProfileView.mockReturnValue({
      isLoading: false,
      data: mockProfileData,
      error: null,
    });
    useLearnerCreditPlans.mockReturnValue({
      isLoading: false,
      data: {
        policies: mockCreditPlansData,
        assignmentsForDisplay: [],
      },
      error: null,
    });
  });

  it('renders breadcrumb from people management page', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
    });
    render(<LearnerDetailPageWrapper />);
    const expectedLink = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.peopleManagement}`;
    const peopleManagementBreadcrumb = screen.getByText('People Management');
    expect(peopleManagementBreadcrumb).toBeInTheDocument();
    expect(peopleManagementBreadcrumb).toHaveAttribute('href', expectedLink);
  });

  it('renders breadcrumb from group detail page', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
      groupUuid: TEST_GROUP.uuid,
    });
    render(<LearnerDetailPageWrapper />);
    const expectedLink = `/${ENTERPRISE_SLUG}/admin/${ROUTE_NAMES.peopleManagement}/${TEST_GROUP.uuid}`;
    const groupDetailBreadcrumbs = screen.getAllByText(TEST_GROUP.name);
    expect(groupDetailBreadcrumbs).toHaveLength(1);
    expect(groupDetailBreadcrumbs[0]).toHaveAttribute('href', expectedLink);
  });

  it('renders learner detail card', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
    });
    render(<LearnerDetailPageWrapper />);
    await waitFor(() => expect(screen.getAllByText('Art Donaldson')).toHaveLength(2));
    expect(screen.getByText('artdonaldson@atp.com')).toBeInTheDocument();
    expect(screen.getByText('Joined on Jun 30, 2023')).toBeInTheDocument();
  });

  it('renders groups section', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
    });
    render(<LearnerDetailPageWrapper />);
    await waitFor(() => {
      expect(screen.getByText('Groups')).toBeInTheDocument();
    });
    const firstGroupLink = screen.getByText(TEST_GROUP.name);
    expect(firstGroupLink).toBeInTheDocument();
    expect(firstGroupLink).toHaveAttribute('href', '/test-slug/admin/people-management/1276');
    const secondGroupLink = screen.getByText('Another Group');
    expect(secondGroupLink).toBeInTheDocument();
    expect(secondGroupLink).toHaveAttribute('href', '/test-slug/admin/people-management/6721');
    expect(screen.getByText('Accepted: March 10, 2025')).toBeInTheDocument();
    expect(screen.getByText('Removed: March 17, 2025')).toBeInTheDocument();
  });

  it('renders groups section without groups', async () => {
    useEnterpriseGroupMemberships.mockReturnValue({
      data: {
        data: {
          results: [],
        },
      },
    });
    render(<LearnerDetailPageWrapper />);
    await waitFor(() => {
      expect(screen.getByText('This learner has not been added to any groups.')).toBeInTheDocument();
    });
  });

  it('renders learner access information when data is loaded', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
    });

    useLearnerProfileView.mockReturnValue({
      isLoading: false,
      data: mockProfileData,
      error: null,
    });
    useLearnerCreditPlans.mockReturnValue({
      isLoading: false,
      data: {
        policies: mockCreditPlansData,
        assignmentsForDisplay: [],
      },
      error: null,
    });

    render(<LearnerDetailPageWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Learning Access')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('SUBSCRIPTION')).toBeInTheDocument();
      expect(screen.getByText('Test Subscription Plan')).toBeInTheDocument();
    });

    await waitFor(() => {
      const learnerCreditHeader = screen.getByText((content, element) => (
        element.tagName.toLowerCase() === 'h5' && content.includes('LEARNER CREDIT')
      ));
      expect(learnerCreditHeader).toBeInTheDocument();
      expect(screen.getByText('Test Credit Plan')).toBeInTheDocument();
    });
  });

  it('shows error message when there is an error loading access information', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
    });
    useLearnerProfileView.mockReturnValue({
      isLoading: false,
      data: null,
      error: new Error('Failed to load profile'),
    });
    useLearnerCreditPlans.mockReturnValue({
      isLoading: false,
      data: null,
      error: null,
    });
    render(<LearnerDetailPageWrapper />);
    await waitFor(() => {
      expect(screen.getByText('Error loading learner information')).toBeInTheDocument();
    });
  });

  it('renders enrollment section', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
    });
    useLearnerProfileView.mockReturnValue({
      isLoading: false,
      data: mockProfileData,
      error: null,
    });

    render(<LearnerDetailPageWrapper />);
    await waitFor(() => {
      expect(screen.getByText('Enrollments')).toBeInTheDocument();
    });
    expect(screen.getByText('Individualism and Identity in Severance')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    const viewCourseButtons = screen.getAllByText('View course');
    expect(viewCourseButtons.length).toEqual(2);

    expect(screen.getByText('The Corruptive Nature of Wealth in White Lotus')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});
