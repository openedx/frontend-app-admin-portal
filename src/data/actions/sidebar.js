import {
  ENABLE_SIDEBAR,
  TOGGLE_SIDEBAR,
  FETCH_SIDEBAR_DATA_REQUEST,
  FETCH_SIDEBAR_DATA_SUCCESS,
  FETCH_SIDEBAR_DATA_FAILURE,
} from '../constants/sidebar';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

const enableSidebar = enabled => ({
  type: ENABLE_SIDEBAR,
  enabled,
});

const toggleSidebar = () => ({
  type: TOGGLE_SIDEBAR,
});

const fetchSidebarDataRequest = () => ({
  type: FETCH_SIDEBAR_DATA_REQUEST,
});

const fetchSidebarDataSuccess = data => ({
  type: FETCH_SIDEBAR_DATA_SUCCESS,
  payload: { data },
});

const fetchSidebarDataFailure = error => ({
  type: FETCH_SIDEBAR_DATA_FAILURE,
  payload: { error },
});

const fetchSidebarData = (enterpriseId, options) => (
  (dispatch) => {
    dispatch(fetchSidebarDataRequest());
    return EnterpriseDataApiService.fetchSidebarData(enterpriseId, options)
      .then((response) => {
        dispatch(fetchSidebarDataSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchSidebarDataFailure(error));
      });
  }
);

export {
  enableSidebar,
  toggleSidebar,
  fetchSidebarData,
};
