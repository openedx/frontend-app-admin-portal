import {
  EMAIL_TEMPLATE_REQUEST,
  EMAIL_TEMPLATE_SUCCESS,
  EMAIL_TEMPLATE_FAILURE,
} from '../constants/emailTemplate';

import EcommerceApiService from '../services/EcommerceApiService';

const emailTemplateRequest = () => ({
  type: EMAIL_TEMPLATE_REQUEST,
});

const emailTemplateSuccess = data => ({
  type: EMAIL_TEMPLATE_SUCCESS,
  payload: {
    data,
  },
});

const emailTemplateFailure = error => ({
  type: EMAIL_TEMPLATE_FAILURE,
  payload: {
    error,
  },
});

const fetchEmailTemplates = options => (
  (dispatch) => {
    dispatch(emailTemplateRequest());
    return EcommerceApiService.fetchEmailTemplate(options)
      .then((response) => {
        dispatch(emailTemplateSuccess(response.data));
      })
      .catch((error) => {
        dispatch(emailTemplateFailure(error));
      });
  }
);

export default fetchEmailTemplates;
