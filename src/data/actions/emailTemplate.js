import {
  EMAIL_TEMPLATE_REQUEST,
  EMAIL_TEMPLATE_SUCCESS,
  EMAIL_TEMPLATE_FAILURE,
  SAVE_TEMPLATE_REQUEST,
  SAVE_TEMPLATE_SUCCESS,
  SAVE_TEMPLATE_FAILURE,
  SET_EMAIL_TEMPLATE_SOURCE,
  ALL_EMAIL_TEMPLATE_SUCCESS,
  UPDATE_ALL_TEMPLATES_SUCCESS,
  ADD_NEW_TO_ALL_TEMPLATES_SUCCESS,
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

const allEmailTemplateSuccess = data => ({
  type: ALL_EMAIL_TEMPLATE_SUCCESS,
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

const updateAllTemplatesSuccess = data => ({
  type: UPDATE_ALL_TEMPLATES_SUCCESS,
  payload: { data },
});

const AddNewToAllTemplatesSuccess = data => ({
  type: ADD_NEW_TO_ALL_TEMPLATES_SUCCESS,
  payload: { data },
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
        if (!options.active) {
          dispatch(allEmailTemplateSuccess(response.data.results));
        }
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
        if (options.id) {
          dispatch(updateAllTemplatesSuccess(response.data));
        } else {
          dispatch(AddNewToAllTemplatesSuccess(response.data));
        }
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
