import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useBudgetDetailTabs } from '../useBudgetDetailTabs';
import {
  BUDGET_DETAIL_ACTIVITY_TAB,
  BUDGET_DETAIL_CATALOG_TAB,
  BUDGET_DETAIL_MEMBERS_TAB,
  BUDGET_DETAIL_REQUESTS_TAB,
} from '../../constants';
import { BUDGET_STATUSES } from '../../../../EnterpriseApp/data/constants';

// Mock getBudgetStatus
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  getBudgetStatus: jest.fn(),
}));

const { getBudgetStatus } = require('../../utils');

const wrapper = ({ children }) => (
  <IntlProvider locale="en">
    {children}
  </IntlProvider>
);

const mockProps = {
  activeTabKey: BUDGET_DETAIL_ACTIVITY_TAB,
  subsidyAccessPolicy: {
    subsidyActiveDatetime: '2024-01-01T00:00:00Z',
    subsidyExpirationDatetime: '2024-12-31T23:59:59Z',
    retired: false,
    groupAssociations: [{ id: 1 }],
    isAssignable: true,
    bnrEnabled: true,
  },
  appliesToAllContexts: false,
  enterpriseGroupLearners: { count: 5 },
  refreshMembersTab: false,
  setRefreshMembersTab: jest.fn(),
  enterpriseFeatures: { topDownAssignmentRealTimeLcm: true },
  ActivityTabElement: () => <div>Activity</div>,
  CatalogTabElement: () => <div>Catalog</div>,
  MembersTabElement: () => <div>Members</div>,
  RequestsTabElement: () => <div>Requests</div>,
};

describe('useBudgetDetailTabs', () => {
  beforeEach(() => {
    getBudgetStatus.mockReturnValue({ status: BUDGET_STATUSES.active });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns activity tab by default', () => {
    const { result } = renderHook(() => useBudgetDetailTabs(mockProps), { wrapper });

    expect(result.current).toHaveLength(4); // Activity, Catalog, Members, Requests
    expect(result.current[0].key).toBe(BUDGET_DETAIL_ACTIVITY_TAB);
    expect(result.current[0].props.eventKey).toBe(BUDGET_DETAIL_ACTIVITY_TAB);
  });

  test('includes catalog tab when showCatalog conditions are met', () => {
    const { result } = renderHook(() => useBudgetDetailTabs(mockProps), { wrapper });

    const catalogTab = result.current.find(tab => tab.key === BUDGET_DETAIL_CATALOG_TAB);
    expect(catalogTab).toBeDefined();
    expect(catalogTab.props.disabled).toBe(false);
  });

  test('disables catalog tab when budget is retired', () => {
    getBudgetStatus.mockReturnValue({ status: BUDGET_STATUSES.retired });

    const { result } = renderHook(() => useBudgetDetailTabs(mockProps), { wrapper });

    const catalogTab = result.current.find(tab => tab.key === BUDGET_DETAIL_CATALOG_TAB);
    expect(catalogTab.props.disabled).toBe(true);
  });

  test('excludes catalog tab when showCatalog conditions are not met', () => {
    const propsWithoutCatalog = {
      ...mockProps,
      subsidyAccessPolicy: {
        ...mockProps.subsidyAccessPolicy,
        groupAssociations: [],
        isAssignable: false,
      },
      appliesToAllContexts: true,
      enterpriseFeatures: { topDownAssignmentRealTimeLcm: false },
    };

    const { result } = renderHook(() => useBudgetDetailTabs(propsWithoutCatalog), { wrapper });

    const catalogTab = result.current.find(tab => tab.key === BUDGET_DETAIL_CATALOG_TAB);
    expect(catalogTab).toBeUndefined();
  });

  test('includes members tab when group learners exist and not applies to all contexts', () => {
    const { result } = renderHook(() => useBudgetDetailTabs(mockProps), { wrapper });

    const membersTab = result.current.find(tab => tab.key === BUDGET_DETAIL_MEMBERS_TAB);
    expect(membersTab).toBeDefined();
    expect(membersTab.props['data-testid']).toBe('group-members-tab');
  });

  test('excludes members tab when no group learners', () => {
    const propsWithoutMembers = {
      ...mockProps,
      enterpriseGroupLearners: { count: 0 },
    };

    const { result } = renderHook(() => useBudgetDetailTabs(propsWithoutMembers), { wrapper });

    const membersTab = result.current.find(tab => tab.key === BUDGET_DETAIL_MEMBERS_TAB);
    expect(membersTab).toBeUndefined();
  });

  test('includes requests tab when BNR is enabled', () => {
    const { result } = renderHook(() => useBudgetDetailTabs(mockProps), { wrapper });

    const requestsTab = result.current.find(tab => tab.key === BUDGET_DETAIL_REQUESTS_TAB);
    expect(requestsTab).toBeDefined();
  });

  test('excludes requests tab when BNR is disabled', () => {
    const propsWithoutBnr = {
      ...mockProps,
      subsidyAccessPolicy: {
        ...mockProps.subsidyAccessPolicy,
        bnrEnabled: false,
      },
    };

    const { result } = renderHook(() => useBudgetDetailTabs(propsWithoutBnr), { wrapper });

    const requestsTab = result.current.find(tab => tab.key === BUDGET_DETAIL_REQUESTS_TAB);
    expect(requestsTab).toBeUndefined();
  });

  test('renders active tab content when activeTabKey matches', () => {
    const propsWithActiveRequestsTab = {
      ...mockProps,
      activeTabKey: BUDGET_DETAIL_REQUESTS_TAB,
    };

    const { result } = renderHook(() => useBudgetDetailTabs(propsWithActiveRequestsTab), { wrapper });

    const requestsTab = result.current.find(tab => tab.key === BUDGET_DETAIL_REQUESTS_TAB);
    expect(requestsTab).toBeDefined();
    expect(requestsTab.props.children).toBeTruthy();
    expect(requestsTab.props.children.type).toBe(mockProps.RequestsTabElement);
  });
});
