import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fetchEnterpriseGroups, clearEnterpriseGroups } from './enterpriseGroups';
import { getAllFlexEnterpriseGroups } from '../../components/learner-credit-management/data/hooks/useAllFlexEnterpriseGroups';
import {
  FETCH_ENTERPRISE_GROUPS_REQUEST,
  FETCH_ENTERPRISE_GROUPS_SUCCESS,
  FETCH_ENTERPRISE_GROUPS_FAILURE,
  CLEAR_ENTERPRISE_GROUPS,
} from '../constants/enterpriseGroups';
import { axiosMock } from '../../setupTest';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../components/learner-credit-management/data/hooks/useAllFlexEnterpriseGroups');

describe('enterpriseGroups actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  it('creates FETCH_ENTERPRISE_GROUPS_SUCCESS when fetching enterprise groups has been done', () => {
    const enterpriseId = 'test-enterprise-id';
    const mockResponse = { data: 'some data' };
    getAllFlexEnterpriseGroups.mockResolvedValue(mockResponse);

    const expectedActions = [
      { type: FETCH_ENTERPRISE_GROUPS_REQUEST },
      { type: FETCH_ENTERPRISE_GROUPS_SUCCESS, payload: { data: mockResponse } },
    ];
    const store = mockStore({});

    return store.dispatch(fetchEnterpriseGroups(enterpriseId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates FETCH_ENTERPRISE_GROUPS_FAILURE when fetching enterprise groups fails', () => {
    const enterpriseId = 'test-enterprise-id';
    const mockError = new Error('Failed to fetch');
    getAllFlexEnterpriseGroups.mockRejectedValue(mockError);

    const expectedActions = [
      { type: FETCH_ENTERPRISE_GROUPS_REQUEST },
      { type: FETCH_ENTERPRISE_GROUPS_FAILURE, payload: { error: mockError } },
    ];
    const store = mockStore({});

    return store.dispatch(fetchEnterpriseGroups(enterpriseId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates CLEAR_ENTERPRISE_GROUPS when clearing enterprise groups', () => {
    const expectedAction = { type: CLEAR_ENTERPRISE_GROUPS };
    const store = mockStore({});

    store.dispatch(clearEnterpriseGroups());
    expect(store.getActions()).toEqual([expectedAction]);
  });
});
