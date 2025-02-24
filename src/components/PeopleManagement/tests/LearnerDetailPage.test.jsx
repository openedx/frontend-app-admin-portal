import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useEnterpriseGroupUuid } from '../data/hooks';
import LearnerDetailPage from '../LearnerDetailPage/LearnerDetailPage';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';

const ENTERPRISE_ID = 'test-enterprise-id';
const ENTERPRISE_SLUG = 'test-slug';
const LMS_USER_ID = '4123';
const TEST_GROUP = {
  name: 'coolest people',
  uuid: '1276',
  acceptedMembersCount: 0,
  groupType: 'flex',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useEnterpriseGroupUuid: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    ENTERPRISE_ID,
  },
});

const LearnerDetailPageWrapper = () => (
  <BrowserRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <LearnerDetailPage />
      </IntlProvider>
    </Provider>
  </BrowserRouter>
);

describe('LearnerDetailPage', () => {
  beforeEach(() => {
    useEnterpriseGroupUuid.mockReturnValue({ data: TEST_GROUP });
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
});
