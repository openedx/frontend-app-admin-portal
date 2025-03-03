import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect';
import { QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useEnterpriseGroupUuid } from '../data/hooks';
import LearnerDetailPage from '../LearnerDetailPage/LearnerDetailPage';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
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

const TEST_ENTERPRISE_USER = [{
  user: {
    firstName: 'Art',
    lastName: 'Donaldson',
    email: 'artdonaldson@atp.com',
    dateJoined: '2024-09-15T12:53:43Z',
  },
}];

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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useEnterpriseGroupUuid: jest.fn(),
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
    LmsApiService.fetchEnterpriseLearnerData.mockResolvedValue(TEST_ENTERPRISE_USER);
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
    const groupDetailBreadcrumb = screen.getByText(TEST_GROUP.name);
    expect(groupDetailBreadcrumb).toBeInTheDocument();
    expect(groupDetailBreadcrumb).toHaveAttribute('href', expectedLink);
  });
  it('renders learner detail card', async () => {
    useParams.mockReturnValue({
      enterpriseSlug: ENTERPRISE_SLUG,
      learnerId: LMS_USER_ID,
    });
    render(<LearnerDetailPageWrapper />);
    // one as the active label on the breadcrumb, one on the card
    await waitFor(() => expect(screen.getAllByText('Art Donaldson')).toHaveLength(2));
    expect(screen.getByText(TEST_ENTERPRISE_USER[0].user.email)).toBeInTheDocument();
    expect(screen.getByText('Joined on September 15, 2024')).toBeInTheDocument();
  });
});
