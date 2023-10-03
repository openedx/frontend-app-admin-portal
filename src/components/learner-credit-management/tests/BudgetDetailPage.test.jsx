import React from 'react';
import { useParams } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { act } from 'react-dom/test-utils';

import BudgetDetailPage from '../BudgetDetailPage';
import { useOfferSummary, useOfferRedemptions } from '../data';
import { EXEC_ED_OFFER_TYPE } from '../data/constants';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    budgetId: '123',
    activeTabKey: 'activity',
  }),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useOfferSummary: jest.fn(),
  useOfferRedemptions: jest.fn(),
}));

useOfferSummary.mockReturnValue({
  isLoading: false,
  offerSummary: null,
});
useOfferRedemptions.mockReturnValue({
  isLoading: false,
  offerRedemptions: {
    itemCount: 0,
    pageCount: 0,
    results: [],
  },
  fetchOfferRedemptions: jest.fn(),
});

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseId = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: enterpriseId,
    enableLearnerPortal: true,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
  },
};

const mockEnterpriseOfferId = '123';

const mockOfferDisplayName = 'Test Enterprise Offer';
const mockOfferSummary = {
  totalFunds: 5000,
  redeemedFunds: 200,
  remainingFunds: 4800,
  percentUtilized: 0.04,
  offerType: EXEC_ED_OFFER_TYPE,
};

const defaultEnterpriseSubsidiesContextValue = {
  isLoading: false,
};

const BudgetDetailPageWrapper = ({
  initialState = initialStoreState,
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => {
  const store = getMockStore({ ...initialState });
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
          <BudgetDetailPage {...rest} />
        </EnterpriseSubsidiesContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('<BudgetDetailPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: 'activity',
    });
  });

  it('displays spend table in "Activity" tab with empty results', async () => {
    const mockOffer = {
      id: mockEnterpriseOfferId,
      name: mockOfferDisplayName,
      start: '2022-01-01',
      end: '2023-01-01',
    };
    useOfferSummary.mockReturnValue({
      isLoading: false,
      offerSummary: mockOfferSummary,
    });
    useOfferRedemptions.mockReturnValue({
      isLoading: false,
      offerRedemptions: {
        itemCount: 0,
        pageCount: 0,
        results: [],
      },
      fetchOfferRedemptions: jest.fn(),
    });
    renderWithRouter(
      <BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
        offer={mockOffer}
      />,
    );
    // Hero
    expect(screen.getByText('Learner Credit Management'));
    // Breadcrumb
    expect(screen.getByText('Overview'));
    // Activity tab exists and is active
    expect(screen.getByText('Activity').getAttribute('aria-selected')).toBe('true');
    // Spend table is visible within Activity tab contents
    expect(screen.getByText('No results found'));
    // Catalog tab exists and is NOT active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('false');
  });

  it('renders with catalog tab active on initial load', async () => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: 'catalog',
    });
    renderWithRouter(
      <BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />,
    );
    // Catalog tab exists and is active
    expect(screen.getByText('Catalog').getAttribute('aria-selected')).toBe('true');
  });

  it('hides catalog tab when enterpriseFeatures.topDownAssignmentRealTimeLcm is false', () => {
    const initialState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: false,
        },
      },
    };
    renderWithRouter(
      <BudgetDetailPageWrapper
        initialState={initialState}
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />,
    );
    // Catalog tab does NOT exist
    expect(screen.queryByText('Catalog')).toBeFalsy();
  });

  it('defaults to activity tab is no activeTabKey is provided', () => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: undefined,
    });
    renderWithRouter(
      <BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />,
    );
    // Activity tab exists and is active
    expect(screen.getByText('Activity').getAttribute('aria-selected')).toBe('true');
  });

  it('displays not found message is invalid activeTabKey is provided', () => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: 'invalid',
    });
    renderWithRouter(
      <BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('something went wrong', { exact: false })).toBeInTheDocument();
  });

  it('handles user switching to catalog tab', async () => {
    renderWithRouter(
      <BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />,
    );
    const catalogTab = screen.getByText('Catalog');

    await act(async () => {
      userEvent.click(catalogTab);
    });

    await waitFor(() => {
      expect(screen.getByTestId('budget-detail-catalog-tab-contents')).toBeInTheDocument();
    });
  });

  it('displays loading message while loading data', () => {
    renderWithRouter(
      <BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
        enterpriseSubsidiesContextValue={{
          ...defaultEnterpriseSubsidiesContextValue,
          isLoading: true,
        }}
      />,
    );
    expect(screen.getByText('Loading'));
  });
});
