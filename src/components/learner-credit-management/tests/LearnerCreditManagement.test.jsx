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

import LearnerCreditManagement from '../LearnerCreditManagement';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import { useOfferSummary } from '../data/hooks';

jest.mock('../data/hooks');
useOfferSummary.mockReturnValue({
  isLoading: false,
  offerSummary: null,
});

jest.mock('../../NotFoundPage', () => ({
  __esModule: true,
  NotFound: () => <span data-testid="404-page-not-found" />,
}));

jest.mock('../OfferNameHeading', () => ({
  __esModule: true,
  default: ({ name }) => <span>{name}</span>,
}));

jest.mock('../OfferDates', () => ({
  __esModule: true,
  default: ({ start, end }) => (
    <>
      <span>{start}</span>
      <span>{end}</span>
    </>
  ),
}));

jest.mock('../LearnerCreditAllocationTable', () => ({
  __esModule: true,
  default: ({ enterpriseUUID, offerId }) => (
    <>
      <span data-testid="learner-credit-allocation--enterprise-uuid">{enterpriseUUID}</span>
      <span data-testid="learner-credit-allocation--offer-id">{offerId}</span>
    </>
  ),
}));

jest.mock('../LearnerCreditAggregateCards', () => ({
  __esModule: true,
  default: ({
    isLoading, totalFunds, redeemedFunds, remainingFunds, percentUtilized,
  }) => (
    <>
      <span data-testid="learner-credit-aggregate-cards--loading">{isLoading ? 'is loading' : 'is NOT loading'}</span>
      <span data-testid="learner-credit-aggregate-cards--total-funds">{totalFunds}</span>
      <span data-testid="learner-credit-aggregate-cards--redeemed-funds">{redeemedFunds}</span>
      <span data-testid="learner-credit-aggregate-cards--remaining-funds">{remainingFunds}</span>
      <span data-testid="learner-credit-aggregate-cards--percent-utilized">{percentUtilized}</span>
    </>
  ),
}));

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseId = 'test-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
  },
};
const store = getMockStore({ ...initialStore });

const mockEnterpriseOfferId = 123;
const defaultEnterpriseSubsidiesContextValue = {
  offers: [],
};

const mockOfferDisplayName = 'Test Enterprise Offer';
const mockOfferSummary = {
  totalFunds: 5000,
  redeemedFunds: 200,
  remainingFunds: 4800,
  percentUtilized: 0.04,
};

const LearnerCreditManagementWrapper = ({
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => (
  <Provider store={store}>
    <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
      <LearnerCreditManagement {...rest} />
    </EnterpriseSubsidiesContext.Provider>
  </Provider>
);

describe('<LearnerCreditManagement />', () => {
  it('displays not found page with no enterprise offer', () => {
    render(<LearnerCreditManagementWrapper />);
    expect(screen.getByTestId('404-page-not-found'));
  });

  describe('with enterprise offer', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('displays correctly', () => {
      const mockOffer = {
        id: mockEnterpriseOfferId,
        displayName: mockOfferDisplayName,
        startDatetime: '2022-01-01',
        endDatetime: '2023-01-01',
      };
      const subsidiesContextValue = {
        offers: [mockOffer],
      };
      useOfferSummary.mockReturnValue({
        isLoading: false,
        offerSummary: mockOfferSummary,
      });
      render(<LearnerCreditManagementWrapper enterpriseSubsidiesContextValue={subsidiesContextValue} />);
      expect(screen.queryByTestId('404-page-not-found')).toBeFalsy();
      expect(screen.getByText('Learner Credit Management'));
      expect(screen.getByText(mockOffer.displayName));

      expect(screen.getByText(mockOffer.startDatetime));
      expect(screen.getByText(mockOffer.endDatetime));

      expect(screen.getByTestId('learner-credit-allocation--enterprise-uuid')).toHaveTextContent(enterpriseId);
      expect(screen.getByTestId('learner-credit-allocation--offer-id')).toHaveTextContent(mockOffer.id);

      expect(screen.getByTestId('learner-credit-aggregate-cards--loading')).toHaveTextContent('is NOT loading');
      expect(screen.getByTestId('learner-credit-aggregate-cards--total-funds')).toHaveTextContent('5000');
      expect(screen.getByTestId('learner-credit-aggregate-cards--redeemed-funds')).toHaveTextContent('200');
      expect(screen.getByTestId('learner-credit-aggregate-cards--remaining-funds')).toHaveTextContent('4800');
      expect(screen.getByTestId('learner-credit-aggregate-cards--percent-utilized')).toHaveTextContent('0.04');
    });

    describe('status badge', () => {
      it('with non-current offer', () => {
        const subsidiesContextValue = {
          offers: [{
            id: mockEnterpriseOfferId,
            isCurrent: false,
          }],
        };
        useOfferSummary.mockReturnValue = {
          isLoading: false,
          offerSummary: mockOfferSummary,
        };
        render(<LearnerCreditManagementWrapper enterpriseSubsidiesContextValue={subsidiesContextValue} />);
        expect(screen.getByText('Ended'));
      });

      it('with current offer', () => {
        const subsidiesContextValue = {
          offers: [{
            id: mockEnterpriseOfferId,
            isCurrent: true,
          }],
        };
        useOfferSummary.mockReturnValue = {
          isLoading: false,
          offerSummary: mockOfferSummary,
        };
        render(<LearnerCreditManagementWrapper enterpriseSubsidiesContextValue={subsidiesContextValue} />);
        expect(screen.getByText('Active'));
      });
    });
  });
});
