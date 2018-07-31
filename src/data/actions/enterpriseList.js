import {
  FETCH_ENTERPRISE_LIST_REQUEST,
  FETCH_ENTERPRISE_LIST_SUCCESS,
  FETCH_ENTERPRISE_LIST_FAILURE,
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

export default fetchEnterpriseList;
