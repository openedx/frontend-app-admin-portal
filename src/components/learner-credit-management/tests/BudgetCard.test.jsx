/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import dayjs from 'dayjs';
import {
  screen,
  render,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import BudgetCard from '../BudgetCard';
import { useOfferSummary, useOfferRedemptions } from '../data/hooks';
import { EXEC_ED_OFFER_TYPE } from '../data/constants';

jest.mock('../data/hooks');
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
const mockOfferSummary = {
  totalFunds: 5000,
  redeemedFunds: 200,
  remainingFunds: 4800,
  percentUtilized: 0.04,
  offerType: EXEC_ED_OFFER_TYPE,
};

const BudgetCardWrapper = ({ ...rest }) => (
  <Provider store={store}>
    <IntlProvider locale="en">
      <BudgetCard {...rest} />
    </IntlProvider>
  </Provider>
);

describe('<BudgetCard />', () => {
  describe('with enterprise offer', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('displays correctly for all offers', () => {
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
        offerSummary: mockOfferSummary,
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
      expect(screen.getByText('Open Courses Marketplace'));
      expect(screen.getByText('Executive Education'));
      expect(screen.getByText(`$${mockOfferSummary.redeemedFunds.toLocaleString()}`));
      const formattedString = `${dayjs(mockOffer.start).format('MMMM D, YYYY')} - ${dayjs(mockOffer.end).format('MMMM D, YYYY')}`;
      const elementsWithTestId = screen.getAllByTestId('offer-date');
      const firstElementWithTestId = elementsWithTestId[0];
      expect(firstElementWithTestId).toHaveTextContent(formattedString);
    });

    it('displays correctly for Offer type Site', () => {
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
      expect(screen.getByText('Open Courses Marketplace'));
      expect(screen.queryByText('Executive Education')).not.toBeInTheDocument();
      expect(screen.getByText(`$${mockOfferSummary.redeemedFunds.toLocaleString()}`));
      const formattedString = `${dayjs(mockOffer.start).format('MMMM D, YYYY')} - ${dayjs(mockOffer.end).format('MMMM D, YYYY')}`;
      const elementsWithTestId = screen.getAllByTestId('offer-date');
      const firstElementWithTestId = elementsWithTestId[0];
      expect(firstElementWithTestId).toHaveTextContent(formattedString);
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
      render(<BudgetCardWrapper
        offer={mockOffer}
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseId}
      />);
      const elementsWithTestId = screen.getAllByTestId('view-budget');
      const firstElementWithTestId = elementsWithTestId[0];
      await waitFor(() => userEvent.click(firstElementWithTestId));
      expect(screen.getByText('Filters'));
      expect(screen.getByText('No results found'));
    });
  });
});
