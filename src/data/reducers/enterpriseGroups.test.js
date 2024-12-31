import enterpriseGroups from './enterpriseGroups';
import {
  FETCH_ENTERPRISE_GROUPS_REQUEST,
  FETCH_ENTERPRISE_GROUPS_SUCCESS,
  FETCH_ENTERPRISE_GROUPS_FAILURE,
  CLEAR_ENTERPRISE_GROUPS,
} from '../constants/enterpriseGroups';

const initialState = {
  loading: false,
  error: null,
  groups: [],
};

const mockGroupsData = [{
  enterprise_group_uuid: 'test-group-uuid',
  enterprise_group_name: 'test-group-name',
}];

describe('enterpriseGroups reducer', () => {
  it('has initial state', () => {
    expect(enterpriseGroups(undefined, {})).toEqual(initialState);
  });

  it('updates fetch groups request state', () => {
    const expected = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(enterpriseGroups(undefined, {
      type: FETCH_ENTERPRISE_GROUPS_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch groups success state', () => {
    const expected = {
      ...initialState,
      loading: false,
      groups: mockGroupsData,
      error: null,
    };
    expect(enterpriseGroups(undefined, {
      type: FETCH_ENTERPRISE_GROUPS_SUCCESS,
      payload: { data: mockGroupsData },
    })).toEqual(expected);
  });

  it('updates fetch groups failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      loading: false,
      error,
      groups: [],
    };
    expect(enterpriseGroups(undefined, {
      type: FETCH_ENTERPRISE_GROUPS_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('updates clear groups state', () => {
    const state = enterpriseGroups(undefined, {
      type: FETCH_ENTERPRISE_GROUPS_SUCCESS,
      payload: { data: mockGroupsData },
    });

    const expected = {
      ...initialState,
      loading: false,
      error: null,
      groups: [],
    };

    expect(enterpriseGroups(state, {
      type: CLEAR_ENTERPRISE_GROUPS,
    })).toEqual(expected);
  });
});
