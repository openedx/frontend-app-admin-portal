import subscriptionDetails from './subscriptionDetails';
import {
  FETCH_SUBSCRIPTION_DETAILS_REQUEST,
  FETCH_SUBSCRIPTION_DETAILS_SUCCESS,
  FETCH_SUBSCRIPTION_DETAILS_FAILURE,
  CLEAR_SUBSCRIPTION_DETAILS,
} from '../constants/subscriptionDetails';

const initialState = {
  loading: false,
  error: null,
  uuid: null,
  purchaseDate: null,
  startDate: null,
  endDate: null,
  licenses: {
    allocated: 0,
    available: 0,
    assigned: 0,
  },
};

const subscriptionsData = {
  licenses: {
    allocated: 1,
    available: 1,
    assigned: 1,
  },
  uuid: 'test-012-3456-789',
  purchaseDate: '2018-09-31T23:14:35Z',
  startDate: '2018-07-31T23:14:35Z',
  endDate: '2019-07-31T23:14:35Z',
};

describe('subscriptionDetails reducer', () => {
  it('has initial state', () => {
    expect(subscriptionDetails(undefined, {})).toEqual(initialState);
  });

  it('updates fetch subscriptions request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(subscriptionDetails(undefined, {
      type: FETCH_SUBSCRIPTION_DETAILS_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch subscription success state', () => {
    const expected = {
      ...initialState,
      uuid: subscriptionsData.uuid,
      purchaseDate: subscriptionsData.purchaseDate,
      startDate: subscriptionsData.startDate,
      endDate: subscriptionsData.endDate,
      licenses: subscriptionsData.licenses,
    };
    expect(subscriptionDetails(undefined, {
      type: FETCH_SUBSCRIPTION_DETAILS_SUCCESS,
      payload: { data: subscriptionsData },
    })).toEqual(expected);
  });

  it('updates fetch subscriptions failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(subscriptionDetails(undefined, {
      type: FETCH_SUBSCRIPTION_DETAILS_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('clears subscriptions state', () => {
    // dispatch success state such that data already exists
    const state = subscriptionDetails(undefined, {
      type: FETCH_SUBSCRIPTION_DETAILS_SUCCESS,
      payload: { data: subscriptionsData },
    });
    expect(state).toEqual({
      ...subscriptionsData,
      error: null,
      loading: false,
    });

    // dispatch clear state
    expect(subscriptionDetails(undefined, {
      type: CLEAR_SUBSCRIPTION_DETAILS,
    })).toEqual(initialState);
  });
});
