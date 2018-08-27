import {
  FETCH_ENTERPRISE_LIST_REQUEST,
  FETCH_ENTERPRISE_LIST_SUCCESS,
  FETCH_ENTERPRISE_LIST_FAILURE,
  SET_ENTERPRISE_LIST_SEARCH_QUERY,
} from '../constants/enterpriseList';
import LmsApiService from '../services/LmsApiService';

const fetchEnterpriseListRequest = () => ({ type: FETCH_ENTERPRISE_LIST_REQUEST });
const fetchEnterpriseListSuccess = enterprises => ({
  type: FETCH_ENTERPRISE_LIST_SUCCESS,
  payload: { enterprises },
});
const fetchEnterpriseListFailure = error => ({
  type: FETCH_ENTERPRISE_LIST_FAILURE,
  payload: { error },
});
const setSearchQuery = searchQuery => ({
  type: SET_ENTERPRISE_LIST_SEARCH_QUERY,
  payload: { searchQuery },
});

const fetchEnterpriseList = options => (
  (dispatch) => {
    dispatch(fetchEnterpriseListRequest());
    return LmsApiService.fetchEnterpriseList(options)
      .then((response) => {
        dispatch(fetchEnterpriseListSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchEnterpriseListFailure(error));
      });
  }
);

const setEnterpriseListSearchQuery = searchQuery => (
  (dispatch) => {
    dispatch(setSearchQuery(searchQuery));
  }
);

export {
  fetchEnterpriseList,
  setEnterpriseListSearchQuery,
};

