import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import InviteAdminsTable from '../InviteAdminsTable';
import useEnterpriseAdminsTableData from '../data/hooks/useEnterpriseAdminsTableData';

/* =======================
   Mocks
======================= */

jest.mock('react-redux', () => ({
  connect: () => (Component) => Component,
}));

jest.mock('../data/hooks/useEnterpriseAdminsTableData');

jest.mock('../OrgInviteAdminCard', () => function () {
  return <div data-testid="admin-card">Admin Card</div>;
});

jest.mock('@openedx/paragon', () => {
  const actual = jest.requireActual('@openedx/paragon');

  const MockDataTable = ({ children }) => (
    <div data-testid="data-table">{children}</div>
  );

  MockDataTable.FilterStatus = actual.DataTable.FilterStatus;
  MockDataTable.TableControlBar = function ({ children }) {
    return <div data-testid="table-control-bar">{children}</div>;
  };
  MockDataTable.TableFooter = function ({ children }) {
    return <div data-testid="table-footer">{children}</div>;
  };

  return {
    ...actual,
    DataTable: MockDataTable,
    CardView: ({ CardComponent }) => (
      <div data-testid="card-view">
        <CardComponent />
      </div>
    ),
  };
});

/* =======================
   Helpers
======================= */

const messages = {
  'adminPortal.peopleManagement.dataTable.title':
    "Your organization's admins",
  'adminPortal.peopleManagement.dataTable.subtitle':
    'View all admins of your organization.',
};

const renderWithIntl = (ui) => render(
  <IntlProvider locale="en" messages={messages}>
    {ui}
  </IntlProvider>,
);

describe('InviteAdminsTable', () => {
  const defaultHookReturn = {
    isLoading: false,
    enterpriseAdminsTableData: {
      results: [],
      itemCount: 0,
      pageCount: 0,
    },
    fetchEnterpriseAdminsTableData: jest.fn(),
  };

  beforeEach(() => {
    useEnterpriseAdminsTableData.mockReturnValue(defaultHookReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and subtitle using intl messages', () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(
      screen.getByText("Your organization's admins"),
    ).toBeInTheDocument();

    expect(
      screen.getByText('View all admins of your organization.'),
    ).toBeInTheDocument();
  });

  it('renders DataTable', () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      isLoading: true,
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders admin cards when data exists', () => {
    useEnterpriseAdminsTableData.mockReturnValue({
      ...defaultHookReturn,
      enterpriseAdminsTableData: {
        results: [{ id: 1 }],
        itemCount: 1,
        pageCount: 1,
      },
    });

    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('card-view')).toBeInTheDocument();
    expect(screen.getByTestId('admin-card')).toBeInTheDocument();
  });

  it('renders empty table state when no data', () => {
    renderWithIntl(<InviteAdminsTable enterpriseId="test-enterprise" />);

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });
});
