import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import { userEvent } from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ManageCodesTab from '../ManageCodesTab';

import { COUPONS_REQUEST, CLEAR_COUPONS } from '../../../data/constants/coupons';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

const BNR_NEW_FEATURE_ALERT_TEXT = 'browse and request new feature alert!';
jest.mock('../../NewFeatureAlertBrowseAndRequest', () => ({
  __esModule: true,
  default: () => BNR_NEW_FEATURE_ALERT_TEXT,
}));

const mockStore = configureMockStore([thunk]);
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
    enterpriseSlug: 'test-enterprise-slug',
  },
  coupons: {
    loading: false,
    error: null,
    data: {
      count: 0,
      results: [],
    },
  },
  table: {
    'coupon-details': {},
  },
  form: {
    'code-assignment-modal-form': {
      values: {
        'email-address': '',
      },
    },
  },
};

const ManageCodesTabWrapper = ({ store, subsidyRequestConfiguration, ...props }) => {
  const subsidyRequestsContextValue = useMemo(() => ({
    subsidyRequestConfiguration,
  }), [subsidyRequestConfiguration]);

  return (
    <MemoryRouter>
      <Provider store={store}>
        <IntlProvider locale="en">
          <SubsidyRequestsContext.Provider value={subsidyRequestsContextValue}>
            <ManageCodesTab
              location={{}}
              match={{
                path: '/test-page',
              }}
              history={{
                replace: () => {},
              }}
              {...props}
            />
          </SubsidyRequestsContext.Provider>
        </IntlProvider>
      </Provider>
    </MemoryRouter>
  );
};

ManageCodesTabWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
  subsidyRequestConfiguration: {
    subsidyRequestsEnabled: true,
    subsidyType: 'coupon',
  },
};

ManageCodesTabWrapper.propTypes = {
  store: PropTypes.shape({}),
  subsidyRequestConfiguration: PropTypes.shape({}),
};

const sampleCouponData = {
  id: 0,
  title: 'test-title-1',
  start_date: '2019-01-03T23:23:51.581Z',
  end_date: '2019-09-18T14:46:36.716Z',
  errors: [],
  max_uses: 10,
  num_unassigned: 2,
  num_uses: 2,
  available: true,
  usage_limitation: 'Multi-use',
};

describe('ManageCodesTabWrapper', () => {
  describe('renders', () => {
    it('renders empty results correctly', () => {
      const { container } = render(<ManageCodesTabWrapper />);
      expect(container.textContent).toContain('There are no results.');
    });

    it('renders non-empty results correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          data: {
            count: 2,
            num_pages: 1,
            results: [
              sampleCouponData,
              {
                ...sampleCouponData,
                id: 1,
                title: 'test-title-2',
              },
            ],
          },
        },
      });

      const { container } = render(<ManageCodesTabWrapper store={store} />);
      expect(container.textContent).toContain('test-title-1');
      expect(container.textContent).toContain('test-title-2');
    });

    it('renders loading state correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          loading: true,
        },
      });

      const { container } = render(<ManageCodesTabWrapper store={store} />);
      expect(container.textContent).toContain('Loading');
    });

    it('renders error state correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          error: new Error('test error'),
        },
      });

      const { container } = render(<ManageCodesTabWrapper store={store} />);
      expect(container.textContent).toContain('test error');
    });
  });

  it('handles location.state on componentDidMount', async () => {
    render((
      <ManageCodesTabWrapper
        location={{
          state: {
            hasRequestedCodes: true,
          },
        }}
      />
    ));
    const requestedCodeAlert = await screen.findByTestId('code-request-alert');
    expect(requestedCodeAlert).toBeInTheDocument();
  });

  it('handles overview_page query parameter change', () => {
    const store = mockStore({
      ...initialState,
      coupons: {
        ...initialState.coupons,
        data: {
          count: 100,
          num_pages: 2,
          results: [...Array(50)].map((_, index) => ({ ...sampleCouponData, id: index })),
        },
      },
    });
    const spy = jest.spyOn(store, 'dispatch');

    const { rerender } = render(<ManageCodesTabWrapper store={store} />);
    spy.mockClear();

    rerender(<ManageCodesTabWrapper
      store={store}
      location={{
        search: '?overview_page=2',
      }}
    />);

    expect(spy).toHaveBeenCalled();
  });

  it('calls clearCouponOrders() on componentWillUnmount', () => {
    const store = mockStore({ ...initialState });

    const { unmount } = render(<ManageCodesTabWrapper store={store} />);
    unmount();

    const actions = store.getActions();
    expect(actions.some(action => action.type === CLEAR_COUPONS)).toBe(true);
  });

  it('calls expand/collapse callbacks properly', async () => {
    const store = mockStore({
      ...initialState,
      coupons: {
        ...initialState.coupons,
        data: {
          count: 1,
          num_pages: 1,
          results: [
            sampleCouponData,
            {
              ...sampleCouponData,
              id: 1,
              title: 'test-title-2',
            },
          ],
        },
      },
      table: {
        'coupon-details': {},
      },
      csv: {
        'coupon-details': {},
      },
    });
    const user = userEvent.setup();
    render(<ManageCodesTabWrapper store={store} />);

    // expand
    const couponItem = (await screen.findAllByTestId('coupon-item-toggle'))[0];
    await waitFor(() => user.click(couponItem));
    expect(couponItem).toHaveAttribute('aria-expanded', 'true');

    // collapse
    await waitFor(() => user.click(couponItem));
    expect(couponItem).toHaveAttribute('aria-expanded', 'false');
  });

  it('fetches coupons on refresh button click', async () => {
    const store = mockStore({ ...initialState });
    const user = userEvent.setup();
    render(<ManageCodesTabWrapper store={store} />);
    store.clearActions();
    const refreshDataComponent = await screen.findByTestId('refresh-data');
    await waitFor(() => user.click(refreshDataComponent));
    expect(store.getActions().filter(action => action.type === COUPONS_REQUEST)).toHaveLength(1);
  });

  describe('<NewFeatureAlertBrowseAndRequest />', () => {
    it.each([
      {
        subsidyRequestConfiguration: {
          subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
          subsidyRequestsEnabled: false,
        },
        shouldShowAlert: true,
      },
      {
        subsidyRequestConfiguration: {
          subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
          subsidyRequestsEnabled: false,
        },
        shouldShowAlert: false,
      },
      {
        subsidyRequestConfiguration: {
          subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
          subsidyRequestsEnabled: true,
        },
        shouldShowAlert: false,
      },
    ])('should render correctly', ({ subsidyRequestConfiguration, shouldShowAlert }) => {
      const { container } = render(<ManageCodesTabWrapper subsidyRequestConfiguration={subsidyRequestConfiguration} />);

      if (shouldShowAlert) {
        expect(container.textContent).toContain(BNR_NEW_FEATURE_ALERT_TEXT);
      } else {
        expect(container.textContent).not.toContain(BNR_NEW_FEATURE_ALERT_TEXT);
      }
    });
  });
});
