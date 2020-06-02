import {
  FETCH_SUBSCRIPTION_DETAILS_REQUEST,
  FETCH_SUBSCRIPTION_DETAILS_SUCCESS,
  FETCH_SUBSCRIPTION_DETAILS_FAILURE,
  CLEAR_SUBSCRIPTION_DETAILS,
} from '../constants/subscriptionDetails';
import { fetchSubscriptionDetails as fetchSubscriptionDetailsEndpoint } from '../../components/subscriptions/data/service';
import NewRelicService from '../services/NewRelicService';

const emptySubscriptionDetails = {
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

const fetchSubscriptionDetailsRequest = () => ({ type: FETCH_SUBSCRIPTION_DETAILS_REQUEST });
const fetchSubscriptionDetailsSuccess = data => ({
  type: FETCH_SUBSCRIPTION_DETAILS_SUCCESS,
  payload: { data },
});
const fetchSubscriptionDetailsFailure = error => ({
  type: FETCH_SUBSCRIPTION_DETAILS_FAILURE,
  payload: { error },
});

const fetchSubscriptionDetails = enterpriseId => (
  (dispatch) => {
    dispatch(fetchSubscriptionDetailsRequest());
    return fetchSubscriptionDetailsEndpoint(enterpriseId)
      .then((response) => {
        dispatch(fetchSubscriptionDetailsSuccess(response));
      })
      .catch((error) => {
        NewRelicService.logAPIErrorResponse(error);
        // This endpoint returns a 404 if no data exists,
        // so we convert it to an empty response here.
        if (error.response.status === 404) {
          dispatch(fetchSubscriptionDetailsSuccess(emptySubscriptionDetails));
          return;
        }
        dispatch(fetchSubscriptionDetailsFailure(error));
      });
  }
);

const clearSubscriptionDetails = () => dispatch => (dispatch({
  type: CLEAR_SUBSCRIPTION_DETAILS,
}));

export {
  fetchSubscriptionDetails,
  clearSubscriptionDetails,
};
