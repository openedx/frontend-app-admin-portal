import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import BudgetExpiryAlertAndModal from '../index';
import { queryClient } from '../../test/testUtils';
import { useEnterpriseBudgets } from '../../EnterpriseSubsidiesContext/data/hooks';

jest.mock('../../EnterpriseSubsidiesContext/data/hooks', () => ({
  ...jest.requireActual('../../EnterpriseSubsidiesContext/data/hooks'),
  useEnterpriseBudgets: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
    disableExpiryMessagingForLearnerCredit: false,
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
  },
};
const mockEnterpriseBudgetUuid = uuidv4();
const mockEnterpriseBudget = [
  {
    source: 'policy',
    id: mockEnterpriseBudgetUuid,
    name: 'test expiration plan 2 --- Everything',
    start: '2024-04-15T00:00:00Z',
    end: dayjs().add(11, 'days'),
    isCurrent: true,
    aggregates: {
      available: 20000,
      spent: 0,
      pending: 0,
    },
    isAssignable: true,
    isRetired: false,
  },
];

const mockEndDateText = mockEnterpriseBudget[0].end.format('MMM D, YYYY');

const BudgetExpiryAlertAndModalWrapper = ({
  initialState = initialStoreState,
}) => {
  const store = getMockStore(initialState);
  return (
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <Provider store={store}>
          <BudgetExpiryAlertAndModal />
        </Provider>
      </IntlProvider>
    </QueryClientProvider>
  );
};

describe('BudgetExpiryAlertAndModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseBudgets.mockReturnValue({ data: mockEnterpriseBudget });
  });
  it('renders without crashing', () => {
    renderWithRouter(<BudgetExpiryAlertAndModalWrapper />);
    expect(screen.getByTestId('expiry-notification-alert')).toBeTruthy();
    expect(screen.getByText(`Your Learner Credit plan expires ${mockEndDateText}.`, { exact: false })).toBeTruthy();
  });
  it('does not render when budget is non expired and disableExpiryMessagingForLearnerCredit is true', () => {
    const updatedInitialStoreState = {
      portalConfiguration: {
        ...initialStoreState.portalConfiguration,
        disableExpiryMessagingForLearnerCredit: true,
      },
    };
    renderWithRouter(<BudgetExpiryAlertAndModalWrapper initialState={updatedInitialStoreState} />);
    expect(screen.queryByTestId('expiry-notification-alert')).toBeFalsy();
    expect(screen.queryByText(`Your Learner Credit plan expires ${mockEndDateText}.`, { exact: false })).toBeFalsy();
  });
});
