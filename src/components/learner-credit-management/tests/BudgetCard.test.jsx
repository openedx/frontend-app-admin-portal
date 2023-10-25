/* eslint-disable react/prop-types */
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import dayjs from 'dayjs';
import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import BudgetCard from '../BudgetCard';
import { useOfferSummary, useOfferRedemptions } from '../data';
import { BUDGET_TYPES } from '../../EnterpriseApp/data/constants';

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
const initialStore = {
  portalConfiguration: {
    enterpriseId,
  },
};
const store = getMockStore({ ...initialStore });

const mockEnterpriseOfferId = '123';
const mockEnterpriseOfferEnrollmentId = 456;

const mockOfferDisplayName = 'Test Enterprise Offer';

const BudgetCardWrapper = ({ ...rest }) => (
  <MemoryRouter initialEntries={['/test-enterprise/admin/learner-credit']}>
    <Provider store={store}>
      <IntlProvider locale="en">
        <BudgetCard {...rest} />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<BudgetCard />', () => {
  describe('with enterprise offer', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('displays correctly for Offers', () => {
      const mockOffer = {
        id: mockEnterpriseOfferId,
        name: mockOfferDisplayName,
        start: '2022-01-01',
        end: '2023-01-01',
      };
      const mockOfferRedemption = {
        created: '2022-02-01',
        enterpriseEnrollmentId: mockEnterpriseOfferEnrollmentId,
      };
      useOfferSummary.mockReturnValue({
        isLoading: false,
        offerSummary: {
          totalFunds: 5000,
          redeemedFunds: 200,
          remainingFunds: 4800,
          percentUtilized: 0.04,
          offerType: 'Site',
          budgetsSummary: [
            {
              id: 123,
              start: '2022-01-01',
              end: '2022-01-01',
              available: 200,
              spent: 100,
              enterpriseSlug: enterpriseId,
            },
          ],
        },
      });
      useOfferRedemptions.mockReturnValue({
        isLoading: false,
        offerRedemptions: {
          results: [mockOfferRedemption],
          itemCount: 1,
          pageCount: 1,
        },
        fetchOfferRedemptions: jest.fn(),
      });
      render(<BudgetCardWrapper
        offer={mockOffer}
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />);
      expect(screen.getByText('Overview'));
      expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
      const formattedString = `Expired ${dayjs(mockOffer.end).format('MMMM D, YYYY')}`;
      const elementsWithTestId = screen.getAllByTestId('offer-date');
      const firstElementWithTestId = elementsWithTestId[0];
      expect(firstElementWithTestId).toHaveTextContent(formattedString);
    });

    it('renders SubBudgetCard when offerType is ecommerce', () => {
      const mockOffer = {
        id: mockEnterpriseOfferId,
        name: mockOfferDisplayName,
        start: '2022-01-01',
        end: '2023-01-01',
        offerType: BUDGET_TYPES.ecommerce,
      };
      const mockOfferRedemption = {
        created: '2022-02-01',
        enterpriseEnrollmentId: mockEnterpriseOfferEnrollmentId,
      };
      useOfferSummary.mockReturnValue({
        isLoading: false,
        offerSummary: {
          totalFunds: 5000,
          redeemedFunds: 200,
          remainingFunds: 4800,
          percentUtilized: 0.04,
          offerType: 'learner_credit',
          budgetsSummary: [
            {
              id: 123,
              start: '2022-01-01',
              end: '2022-01-01',
              available: 200,
              spent: 100,
              enterpriseSlug: enterpriseId,
            },
          ],
        },
      });
      useOfferRedemptions.mockReturnValue({
        isLoading: false,
        offerRedemptions: {
          results: [mockOfferRedemption],
          itemCount: 1,
          pageCount: 1,
        },
        fetchOfferRedemptions: jest.fn(),
      });

      render(<BudgetCardWrapper
        offer={mockOffer}
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />);

      expect(screen.getByTestId('view-budget')).toBeInTheDocument();
    });

    it('renders SubBudgetCard when offerType is not ecommerce', () => {
      const mockOffer = {
        id: mockEnterpriseOfferId,
        name: mockOfferDisplayName,
        start: '2022-01-01',
        end: '2023-01-01',
        offerType: 'otherOfferType',
      };
      const mockOfferRedemption = {
        created: '2022-02-01',
        enterpriseEnrollmentId: mockEnterpriseOfferEnrollmentId,
      };
      useOfferSummary.mockReturnValue({
        isLoading: false,
        offerSummary: {
          totalFunds: 5000,
          redeemedFunds: 200,
          remainingFunds: 4800,
          percentUtilized: 0.04,
          offerType: 'learner_credit',
          budgetsSummary: [
            {
              id: 123,
              start: '2022-01-01',
              end: '2022-01-01',
              available: 200,
              spent: 100,
              enterpriseSlug: enterpriseId,
            },
          ],
        },
      });
      useOfferRedemptions.mockReturnValue({
        isLoading: false,
        offerRedemptions: {
          results: [mockOfferRedemption],
          itemCount: 1,
          pageCount: 1,
        },
        fetchOfferRedemptions: jest.fn(),
      });

      render(<BudgetCardWrapper
        offer={mockOffer}
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />);

      expect(screen.getByTestId('view-budget')).toBeInTheDocument();
    });
  });
});
