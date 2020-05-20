import {
  EMAIL_TEMPLATE_REQUEST,
  EMAIL_TEMPLATE_SUCCESS,
  EMAIL_TEMPLATE_FAILURE,
  SAVE_TEMPLATE_REQUEST,
  SAVE_TEMPLATE_SUCCESS,
  SAVE_TEMPLATE_FAILURE,
  SET_EMAIL_TEMPLATE_SOURCE,
  CURRENT_FROM_TEMPLATE,
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

const saveTemplateRequest = emailType => ({
  type: SAVE_TEMPLATE_REQUEST,
  payload: { emailType },
});

export const saveTemplateSuccess = (emailType, data) => ({
  type: SAVE_TEMPLATE_SUCCESS,
  payload: { emailType, data },
});
export const currentFromTemplate = (emailType, data) => ({
  type: CURRENT_FROM_TEMPLATE,
  payload: { emailType, data },
});

const saveTemplateFailure = (emailType, error) => ({
  type: SAVE_TEMPLATE_FAILURE,
  payload: { emailType, error },
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

export const saveTemplate = ({
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(saveTemplateRequest(options.email_type));
    return EcommerceApiService.saveTemplate(options)
      .then((response) => {
        dispatch(saveTemplateSuccess(options.email_type, response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(saveTemplateFailure(options.email_type, error));
        onError(error);
      });
  }
);

export const setEmailTemplateSource = emailTemplateSource => (
  (dispatch) => {
    dispatch({
      type: SET_EMAIL_TEMPLATE_SOURCE,
      payload: {
        emailTemplateSource,
      },
    });
  }
);


export default fetchEmailTemplates;
