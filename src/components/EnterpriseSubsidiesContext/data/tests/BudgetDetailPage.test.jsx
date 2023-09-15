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

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter } from 'react-router-dom';
import BudgetDetailPage from '../../../learner-credit-management/BudgetDetailPage';
import { useOfferSummary, useOfferRedemptions } from '../../../learner-credit-management/data/hooks';
import { EXEC_ED_OFFER_TYPE } from '../../../learner-credit-management/data/constants';
import { EnterpriseSubsidiesContext } from '../..';

jest.mock('../../../learner-credit-management/data/hooks');

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
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: enterpriseId,

  },
};
const store = getMockStore({ ...initialStore });

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
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => (
  <MemoryRouter initialEntries={['/test-enterprise/admin/learner-credit/1234']}>

    <Provider store={store}>
      <IntlProvider locale="en">
        <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
          <BudgetDetailPage {...rest} />
        </EnterpriseSubsidiesContext.Provider>
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<BudgetDetailPage />', () => {
  describe('with enterprise offer', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('displays table on clicking view budget', async () => {
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
      render(<BudgetDetailPageWrapper
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
        offer={mockOffer}
      />);
      expect(screen.getByText('Learner Credit Budget Detail'));
      expect(screen.getByText('Overview'));
      expect(screen.getByText('No results found'));
    });
  });
});
