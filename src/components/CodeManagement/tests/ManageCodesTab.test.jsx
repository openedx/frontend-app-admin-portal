import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
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

function ManageCodesTabWrapper({ store, subsidyRequestConfiguration, ...props }) {
  const contextValue = useMemo(() => ({ subsidyRequestConfiguration }), [subsidyRequestConfiguration]);
  return (
    <MemoryRouter>
      <Provider store={store}>
        <IntlProvider locale="en">
          <SubsidyRequestsContext.Provider value={contextValue}>
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
}

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
      const tree = renderer
        .create((
          <ManageCodesTabWrapper />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
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

      const tree = renderer
        .create((
          <ManageCodesTabWrapper store={store} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders loading state correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          loading: true,
        },
      });

      const tree = renderer
        .create((
          <ManageCodesTabWrapper store={store} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders error state correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          error: new Error('test error'),
        },
      });

      const tree = renderer
        .create((
          <ManageCodesTabWrapper store={store} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  it('handles location.state on componentDidMount', () => {
    const wrapper = mount((
      <ManageCodesTabWrapper
        location={{
          state: {
            hasRequestedCodes: true,
          },
        }}
      />
    ));

    expect(wrapper.find('ManageCodesTab').instance().state.hasRequestedCodes).toBeTruthy();
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

    const wrapper = mount(<ManageCodesTabWrapper store={store} />);

    spy.mockRestore();

    wrapper.setProps({
      location: {
        search: '?overview_page=2',
      },
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('calls clearCouponOrders() on componentWillUnmount', () => {
    const store = mockStore({ ...initialState });

    const wrapper = mount(<ManageCodesTabWrapper store={store} />);
    wrapper.unmount();

    const actions = store.getActions();
    expect(actions.filter(action => action.type === CLEAR_COUPONS)).toHaveLength(1);
  });

  it('calls expand/collapse callbacks properly', () => {
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

    const wrapper = mount(<ManageCodesTabWrapper store={store} />);
    const instance = wrapper.find('ManageCodesTab').instance();
    const spyExpand = jest.spyOn(instance, 'handleCouponExpand');
    const spyCollapse = jest.spyOn(instance, 'handleCouponCollapse');

    // expand
    wrapper.find('Coupon').first().find('.metadata').simulate('click');
    expect(spyExpand).toBeCalledTimes(1);

    // collapse
    wrapper.find('Coupon').first().find('.metadata').simulate('click');
    expect(spyCollapse).toBeCalledTimes(1);
  });

  it('fetches coupons on refresh button click', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(<ManageCodesTabWrapper store={store} />);
    store.clearActions();
    wrapper.find('.fa-refresh').hostNodes().simulate('click');
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
      const wrapper = mount(<ManageCodesTabWrapper subsidyRequestConfiguration={subsidyRequestConfiguration} />);

      if (shouldShowAlert) {
        expect(wrapper.text().includes(BNR_NEW_FEATURE_ALERT_TEXT)).toBe(true);
      } else {
        expect(wrapper.text().includes(BNR_NEW_FEATURE_ALERT_TEXT)).toBe(false);
      }
    });
  });
});
