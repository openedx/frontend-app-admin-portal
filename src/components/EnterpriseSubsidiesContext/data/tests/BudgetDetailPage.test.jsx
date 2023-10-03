/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import BudgetDetailPage from '../../../learner-credit-management/BudgetDetailPage';
import { useOfferSummary, useOfferRedemptions } from '../../../learner-credit-management/data';
import { EXEC_ED_OFFER_TYPE } from '../../../learner-credit-management/data/constants';
import { EnterpriseSubsidiesContext } from '../..';

jest.mock('../../../learner-credit-management/data', () => ({
  ...jest.requireActual('../../../learner-credit-management/data'),
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
  describe('with enterprise offer', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('displays spend table with empty results', async () => {
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
      const Component = () => (
        <BudgetDetailPageWrapper
          enterpriseUUID={enterpriseUUID}
          enterpriseSlug={enterpriseId}
          offer={mockOffer}
        />
      );
      renderWithRouter(<Component />, { route: '/test-enterprise/admin/learner-credit/1234/activity' });
      // Hero
      expect(screen.getByText('Learner Credit Management'));
      // Breadcrumb
      expect(screen.getByText('Overview'));
      // Spend table
      expect(screen.getByText('No results found'));
    });

    it('displays loading message while loading data', async () => {
      render(<BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
        enterpriseSubsidiesContextValue={{
          ...defaultEnterpriseSubsidiesContextValue,
          isLoading: true,
        }}
      />);
      expect(screen.getByText('Loading'));
    });
  });
});
