import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import moment from 'moment';
import {
  screen,
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ManageRequestsTab from '../ManageRequestsTab';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { useSubsidyRequests } from '../../SubsidyRequestManagementTable';
import { SUBSIDY_REQUEST_STATUS } from '../../../data/constants/subsidyRequests';
import * as couponActions from '../../../data/actions/coupons';

const mockCouponCodeRequest = {
  uuid: 'test-coupon-code-request-uuid', requestStatus: SUBSIDY_REQUEST_STATUS.REQUESTED,
};

jest.mock('../../../data/actions/coupons');
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
              <button type="button" onClick={() => onApprove(mockCouponCodeRequest)} disabled={disableApproveButton}>
                Approve
              </button>
            </>
          )}
          {!!onDecline && (
            <>
              <span>has onDecline</span>
              <button type="button" onClick={() => onDecline(mockCouponCodeRequest)}>Decline</button>
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
    ApproveCouponCodeRequestModal: jest.fn((props) => (
      <div>
        Approve coupon code request modal
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
        Decline coupon code request modal
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
  coupons: {
    loading: false,
    data: {
      results: [],
    },
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const defaultStore = getMockStore({ ...initialStore });

const mockDecrementCouponCodeRequestCount = jest.fn();

function ManageRequestsTabWithRouter({
  store: storeProp,
}) {
  return (
    <Provider store={storeProp}>
      <SubsidyRequestsContext.Provider value={
        useMemo(() => (
          { decrementCouponCodeRequestCount: mockDecrementCouponCodeRequestCount }), [])
          }
      >
        <ManageRequestsTab />
      </SubsidyRequestsContext.Provider>
    </Provider>
  );
}

ManageRequestsTabWithRouter.propTypes = {
  store: PropTypes.shape(),
};

ManageRequestsTabWithRouter.defaultProps = {
  store: defaultStore,
};

describe('<ManageRequestsTab />', () => {
  beforeEach(() => {
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: false,
      requests: {
        pageCount: 1,
        itemCount: 1,
        requests: [mockCouponCodeRequest],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
      updateRequestStatus: jest.fn(),
    }));
    couponActions.fetchCouponOrders.mockImplementation(() => ({ type: 'COUPONS_REQUEST' }));
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders SubsidyRequestManagementTable with expected props', () => {
    render(<ManageRequestsTabWithRouter />);
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

  it('fetches coupons on load', () => {
    render(<ManageRequestsTabWithRouter />);
    expect(couponActions.fetchCouponOrders).toHaveBeenCalled();
  });

  it('renders <LoadingMessage /> if loading coupons', () => {
    const store = getMockStore({
      ...initialStore,
      coupons: {
        loading: true,
        data: {
          results: [],
        },
      },
    });
    render(<ManageRequestsTabWithRouter store={store} />);
    expect(screen.getByText('Loading'));
  });

  it('renders <LoadingMessage /> if loading coupons', () => {
    const store = getMockStore({
      ...initialStore,
      coupons: {
        loading: true,
        data: {
          results: [],
        },
      },
    });
    render(<ManageRequestsTabWithRouter store={store} />);
    expect(screen.getByText('Loading'));
  });

  it('disables approve buttons if there are no available codes', () => {
    render(<ManageRequestsTabWithRouter />);
    const approveButton = screen.getByText('Approve');
    expect(approveButton.disabled).toBe(true);
  });

  it('renders <ApproveCouponCodeRequestModal /> when approve is clicked', () => {
    const store = getMockStore({
      ...initialStore,
      coupons: {
        loading: false,
        data: {
          results: [{
            endDate: moment().add(1, 'days').toISOString(),
            numUnassigned: 3,
          }],
        },
      },
    });
    render(<ManageRequestsTabWithRouter store={store} />);

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    expect(screen.getByText('Approve coupon code request modal'));
  });

  it('closes <ApproveCouponCodeRequestModal /> when close button is clicked', () => {
    const store = getMockStore({
      ...initialStore,
      coupons: {
        loading: false,
        data: {
          results: [{
            endDate: moment().add(1, 'days').toISOString(),
            numUnassigned: 3,
          }],
        },
      },
    });
    render(<ManageRequestsTabWithRouter store={store} />);

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    expect(screen.getByText('Approve coupon code request modal'));

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Decline coupon code request modal')).not.toBeInTheDocument();
  });

  it('handles successfully approving a request', () => {
    const mockHandleUpdateRequestStatus = jest.fn();
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: false,
      requests: {
        pageCount: 1,
        itemCount: 1,
        requests: [mockCouponCodeRequest],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
      updateRequestStatus: mockHandleUpdateRequestStatus,
    }));

    const store = getMockStore({
      ...initialStore,
      coupons: {
        loading: false,
        data: {
          results: [{
            endDate: moment().add(1, 'days').toISOString(),
            numUnassigned: 3,
          }],
        },
      },
    });
    render(<ManageRequestsTabWithRouter store={store} />);

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    expect(screen.getByText('Approve coupon code request modal'));

    const approveInModalButton = screen.getByText('Approve in modal');
    fireEvent.click(approveInModalButton);
    expect(mockHandleUpdateRequestStatus).toHaveBeenCalledWith(
      { request: mockCouponCodeRequest, newStatus: SUBSIDY_REQUEST_STATUS.PENDING },
    );
    expect(mockDecrementCouponCodeRequestCount).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Approve in modal')).not.toBeInTheDocument();
  });

  it('renders <DeclineSubsidyRequestModal /> when decline is clicked', () => {
    render(<ManageRequestsTabWithRouter />);

    const declineButton = screen.getByText('Decline');
    fireEvent.click(declineButton);
    expect(screen.getByText('Decline coupon code request modal'));
  });

  it('closes <DeclineSubsidyRequestModal /> when close button is clicked', () => {
    render(<ManageRequestsTabWithRouter />);

    const declineButton = screen.getByText('Decline');
    fireEvent.click(declineButton);
    expect(screen.getByText('Decline coupon code request modal'));

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Decline coupon code request modal')).not.toBeInTheDocument();
  });

  it('handles successfully declining a request', () => {
    const mockHandleUpdateRequestStatus = jest.fn();
    useSubsidyRequests.mockImplementation(() => ({
      isLoading: false,
      requests: {
        pageCount: 1,
        itemCount: 1,
        requests: [mockCouponCodeRequest],
      },
      requestsOverview: [],
      handleFetchRequests: jest.fn(),
      updateRequestStatus: mockHandleUpdateRequestStatus,
    }));

    const store = getMockStore({
      ...initialStore,
      coupons: {
        loading: false,
        data: {
          results: [{
            endDate: moment().add(1, 'days').toISOString(),
            numUnassigned: 3,
          }],
        },
      },
    });
    render(<ManageRequestsTabWithRouter store={store} />);

    const declineButton = screen.getByText('Decline');
    fireEvent.click(declineButton);
    expect(screen.getByText('Decline coupon code request modal'));

    const declineInModalButton = screen.getByText('Decline in modal');
    fireEvent.click(declineInModalButton);
    expect(mockHandleUpdateRequestStatus).toHaveBeenCalledWith(
      { request: mockCouponCodeRequest, newStatus: SUBSIDY_REQUEST_STATUS.DECLINED },
    );
    expect(mockDecrementCouponCodeRequestCount).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Decline in modal')).not.toBeInTheDocument();
  });
});
