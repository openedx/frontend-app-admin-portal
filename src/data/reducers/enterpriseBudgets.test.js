import enterpriseBudgets from './enterpriseBudgets';
import {
  FETCH_ENTERPRISE_BUDGETS_REQUEST,
  FETCH_ENTERPRISE_BUDGETS_SUCCESS,
  FETCH_ENTERPRISE_BUDGETS_FAILURE,
  CLEAR_ENTERPRISE_BUDGETS,
} from '../constants/enterpriseBudgets';

const initialState = {
  loading: false,
  error: null,
  budgets: null,
};

const mockBudgetsData = [{
  subsidy_access_policy_uuid: '8d6503dd-e40d-42b8-442b-37dd4c5450e3',
  subsidy_access_policy_display_name: 'Everything',
}];

describe('enterpriseBudgets reducer', () => {
  it('has initial state', () => {
    expect(enterpriseBudgets(undefined, {})).toEqual(initialState);
  });

  it('updates fetch budgets request state', () => {
    const expected = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(enterpriseBudgets(undefined, {
      type: FETCH_ENTERPRISE_BUDGETS_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch budgets success state', () => {
    const expected = {
      ...initialState,
      loading: false,
      budgets: mockBudgetsData,
      error: null,
    };
    expect(enterpriseBudgets(undefined, {
      type: FETCH_ENTERPRISE_BUDGETS_SUCCESS,
      payload: { data: mockBudgetsData },
    })).toEqual(expected);
  });

  it('updates fetch budgets failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      loading: false,
      error,
      budgets: null,
    };
    expect(enterpriseBudgets(undefined, {
      type: FETCH_ENTERPRISE_BUDGETS_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('updates clear budgets state', () => {
    const state = enterpriseBudgets(undefined, {
      type: FETCH_ENTERPRISE_BUDGETS_SUCCESS,
      payload: { data: mockBudgetsData },
    });

    const expected = {
      ...initialState,
      loading: false,
      error: null,
      budgets: null,
    };

    expect(enterpriseBudgets(state, {
      type: CLEAR_ENTERPRISE_BUDGETS,
    })).toEqual(expected);
  });
});
