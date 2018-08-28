import enterpriseList from './enterpriseList';
import {
  FETCH_ENTERPRISE_LIST_REQUEST,
  FETCH_ENTERPRISE_LIST_SUCCESS,
  FETCH_ENTERPRISE_LIST_FAILURE,
  SET_ENTERPRISE_LIST_SEARCH_QUERY,
} from '../constants/enterpriseList';

const initialState = {
  enterprises: null,
  loading: false,
  error: null,
  searchQuery: null,
};

describe('enterpriseList reducer', () => {
  it('has initial state', () => {
    expect(enterpriseList(undefined, {})).toEqual(initialState);
  });

  it('updates fetch enterpriseList request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(enterpriseList(undefined, {
      type: FETCH_ENTERPRISE_LIST_REQUEST,
    })).toEqual(expected);
  });

  it('updates state on fetch enterpriseList success', () => {
    const enterpriseListData = {
      count: 3,
      num_pages: 1,
      current_page: 1,
      results: [
        {
          uuid: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
          name: 'Enterprise 1',
          slug: 'enterprise-1',
          active: true,
        },
      ],
    };

    const expected = {
      ...initialState,
      enterprises: enterpriseListData,
    };
    expect(enterpriseList(undefined, {
      type: FETCH_ENTERPRISE_LIST_SUCCESS,
      payload: { enterprises: enterpriseListData },
    })).toEqual(expected);
  });

  it('updates state on fetch enterpriseList failure', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(enterpriseList(undefined, {
      type: FETCH_ENTERPRISE_LIST_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('updates state on set search query', () => {
    const searchQuery = 'foobar';
    const expected = {
      ...initialState,
      searchQuery,
    };
    expect(enterpriseList(undefined, {
      type: SET_ENTERPRISE_LIST_SEARCH_QUERY,
      payload: { searchQuery },
    })).toEqual(expected);
  });
});
