import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import SubscriptionSubsidyRequests from '../SubscriptionSubsidyRequests';
import { useSubsidyRequests } from '../../SubsidyRequestManagementTable';
import { SubscriptionContext } from '../SubscriptionData';
import { SUBSIDY_REQUESTS_TYPES } from '../../SubsidyRequestManagementTable/data/constants';
import { SUBSIDY_REQUEST_STATUS } from '../../../data/constants/subsidyRequests';
import { SubsidyRequestsContext } from '../../subsidy-requests';

const mockLicenseRequest = {
  uuid: 'test-license-request-uuid', requestStatus: SUBSIDY_REQUESTS_TYPES.REQUESTED,
};
jest.mock('../../SubsidyRequestManagementTable', () => {
  const originalModule = jest.requireActual('../../SubsidyRequestManagementTable');
  return {
    __esModule: true,
    ...originalModule,
    /* eslint-disable react/prop-types */
    default: ({
      children,
      isLoading,
      data,
      itemCount,
      pageCount,
      fetchData,
      requestStatusFilterChoices,
      onApprove,
      onDecline,
      initialTableOptions,
      initialState,
      disableApproveButton,
    }) => {
      const hasInitialTableOptions = !!initialTableOptions?.getRowId({ uuid: 'test-uuid-1' });
      return (
        <>
          <h2>SubsidyRequestManagementTable</h2>
          {isLoading !== undefined && <span>has isLoading</span>}
          {!!data && <span>has data</span>}
          {itemCount !== undefined && <span>has itemCount</span>}
          {pageCount !== undefined && <span>has pageCount</span>}
          {!!fetchData && <span>has fetchData</span>}
          {!!requestStatusFilterChoices && <span>has requestStatusFilterChoices</span>}
          {!!onApprove && (
            <>
              <span>has onApprove</span>
              <button type="button" onClick={() => onApprove(mockLicenseRequest)} disabled={disableApproveButton}>
                Approve
              </button>
            </>
          )}
          {!!onDecline && (
            <>
              <span>has onDecline</span>
              <button type="button" onClick={() => onDecline(mockLicenseRequest)}>Decline</button>
            </>
          )}
          {!!hasInitialTableOptions && <span>has initialTableOptions</span>}
          {!!initialState && <span>has initialState</span>}
          {!!children && <span>has children</span>}
        </>
      );
    },
    /* eslint-enable react/prop-types */
    useSubsidyRequests: jest.fn(),
  };
});
jest.mock('../../subsidy-request-modals', () => {
  const originalModule = jest.requireActual('../../subsidy-request-modals');
  return {
    ...originalModule,
    ApproveLicenseRequestModal: jest.fn((props) => (
      <div>
        Approve license request modal
        <button
          type="button"
          onClick={() => {
            props.onSuccess();
          }}
        >
          Approve in modal
        </button>
        <button
          type="button"
          onClick={() => {
            props.onClose();
          }}
        >
          Close
        </button>
      </div>
    )),
    DeclineSubsidyRequestModal: jest.fn((props) => (
      <div>
        Decline license request modal
        <button
          type="button"
          onClick={() => {
            props.onSuccess();
          }}
        >
          Decline in modal
        </button>
        <button
          type="button"
          onClick={() => {
            props.onClose();
          }}
        >
          Close
        </button>
      </div>
    )),
  };
});

const enterpriseId = 'test-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
  },
};
const initialSubscriptionsData = {
  data: {
    results: [],
  },
  loading: false,
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const store = getMockStore({ ...initialStore });

const mockDecrementLicenseRequestCount = jest.fn();
const defaultSubsidyRequestsContextValue = { decrementLicenseRequestCount: mockDecrementLicenseRequestCount };

const SubsidySubsidyRequestsWithRouter = ({
  store: storeProp,
  subscriptionsData,
  initialSubsidyRequestsContextValue,
}) => (
  <Provider store={storeProp}>
    <SubsidyRequestsContext.Provider value={initialSubsidyRequestsContextValue}>
      <SubscriptionContext.Provider value={subscriptionsData}>
        <SubscriptionSubsidyRequests />
      </SubscriptionContext.Provider>
    </SubsidyRequestsContext.Provider>
  </Provider>
);

SubsidySubsidyRequestsWithRouter.propTypes = {
  store: PropTypes.shape(),
  subscriptionsData: PropTypes.shape(),
  initialSubsidyRequestsContextValue: PropTypes.shape(),
};

SubsidySubsidyRequestsWithRouter.defaultProps = {
  store,
  subscriptionsData: initialSubscriptionsData,
  initialSubsidyRequestsContextValue: defaultSubsidyRequestsContextValue,
};

describe('<SubscriptionSubsidyRequests />', () => {
  beforeEach(() => {
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: false,
      requests: {
        pageCount: 1,
        itemCount: 1,
        requests: [mockLicenseRequest],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
      updateRequestStatus: jest.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders SubsidyRequestManagementTable with expected props', () => {
    render(<SubsidySubsidyRequestsWithRouter />);
    const expectedProps = [
      'isLoading',
      'data',
      'itemCount',
      'pageCount',
      'fetchData',
      'requestStatusFilterChoices',
      'onApprove',
      'onDecline',
      'initialTableOptions',
      'initialState',
    ];
    expectedProps.forEach((prop) => {
      expect(screen.getByText(`has ${prop}`));
    });
    expect(screen.queryByText('has children')).toBeFalsy();
  });

  it('renders <LoadingMessage /> if loading subscriptions data', () => {
    render(<SubsidySubsidyRequestsWithRouter subscriptionsData={{
      data: {
        results: [],
      },
      loading: true,
    }}
    />);
    expect(screen.getByText('Loading'));
  });

  it('disables approve buttons if there are no available codes', () => {
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: false,
      requests: {
        pageCount: 1,
        itemCount: 1,
        requests: [mockLicenseRequest],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
    }));
    render(<SubsidySubsidyRequestsWithRouter />);

    const approveButton = screen.getByText('Approve');
    expect(approveButton.disabled).toBe(true);
  });

  it('renders <ApproveLicenseRequestModal /> when approve is clicked', () => {
    render(<SubsidySubsidyRequestsWithRouter subscriptionsData={{
      data: {
        results: [{
          daysUntilExpiration: 100,
          licenses: {
            unassigned: 1,
          },
        }],
      },
      loading: false,
    }}
    />);
    const approveButton = screen.getByText('Approve');
    userEvent.click(approveButton);
    expect(screen.getByText('Approve license request modal'));
  });

  it('handles successfully approving a request', () => {
    const mockHandleUpdateRequestStatus = jest.fn();
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: false,
      requests: {
        pageCount: 1,
        itemCount: 1,
        requests: [mockLicenseRequest],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
      updateRequestStatus: mockHandleUpdateRequestStatus,
    }));

    render(<SubsidySubsidyRequestsWithRouter subscriptionsData={{
      data: {
        results: [{
          daysUntilExpiration: 100,
          licenses: {
            unassigned: 1,
          },
        }],
      },
      loading: false,
    }}
    />);
    const approveButton = screen.getByText('Approve');
    userEvent.click(approveButton);
    expect(screen.getByText('Approve license request modal'));

    const approveInModalButton = screen.getByText('Approve in modal');
    userEvent.click(approveInModalButton);
    expect(mockHandleUpdateRequestStatus).toHaveBeenCalledWith(
      { request: mockLicenseRequest, newStatus: SUBSIDY_REQUEST_STATUS.PENDING },
    );
    expect(mockDecrementLicenseRequestCount).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Approve in modal')).not.toBeInTheDocument();
  });

  it('renders <DeclineSubsidyRequestModal /> when decline is clicked', () => {
    render(<SubsidySubsidyRequestsWithRouter />);

    const declineButton = screen.getByText('Decline');
    userEvent.click(declineButton);
    expect(screen.getByText('Decline license request modal'));
  });

  it('closes <DeclineSubsidyRequestModal /> when close button is clicked', () => {
    render(<SubsidySubsidyRequestsWithRouter />);

    const declineButton = screen.getByText('Decline');
    userEvent.click(declineButton);
    expect(screen.getByText('Decline license request modal'));

    const closeButton = screen.getByText('Close');
    userEvent.click(closeButton);

    expect(screen.queryByText('Decline license request modal')).not.toBeInTheDocument();
  });

  it('handles successfully declining a request', () => {
    const mockHandleUpdateRequestStatus = jest.fn();
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: false,
      requests: {
        pageCount: 1,
        itemCount: 1,
        requests: [mockLicenseRequest],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
      updateRequestStatus: mockHandleUpdateRequestStatus,
    }));

    render(<SubsidySubsidyRequestsWithRouter subscriptionsData={{
      data: {
        results: [{
          daysUntilExpiration: 100,
          licenses: {
            unassigned: 1,
          },
        }],
      },
      loading: false,
    }}
    />);
    const declineButton = screen.getByText('Decline');
    userEvent.click(declineButton);
    expect(screen.getByText('Decline license request modal'));

    const declineInModalButton = screen.getByText('Decline in modal');
    userEvent.click(declineInModalButton);
    expect(mockHandleUpdateRequestStatus).toHaveBeenCalledWith(
      { request: mockLicenseRequest, newStatus: SUBSIDY_REQUEST_STATUS.DECLINED },
    );
    expect(mockDecrementLicenseRequestCount).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Decline in modal')).not.toBeInTheDocument();
  });
});
