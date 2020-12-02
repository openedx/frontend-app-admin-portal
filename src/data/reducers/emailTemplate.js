import {
  EMAIL_TEMPLATE_SUCCESS,
  EMAIL_TEMPLATE_REQUEST,
  EMAIL_TEMPLATE_FAILURE,
  SAVE_TEMPLATE_REQUEST,
  SAVE_TEMPLATE_SUCCESS,
  SAVE_TEMPLATE_FAILURE,
  SET_EMAIL_TEMPLATE_SOURCE,
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  CURRENT_FROM_TEMPLATE,
  SET_EMAIL_ADDRESS,
} from '../constants/emailTemplate';

import { transformTemplate, updateAllTemplates, updateTemplateEmailAddress } from '../../utils';
import assignEmailTemplate from '../../components/CodeAssignmentModal/emailTemplate';
import remindEmailTemplate from '../../components/CodeReminderModal/emailTemplate';
import revokeEmailTemplate from '../../components/CodeRevokeModal/emailTemplate';
import subscribeEmailTemplate from '../../components/AddUsersModal/emailTemplate';

export const initialState = {
  saving: false,
  loading: false,
  error: null,
  emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
  default: {
    assign: {
      'email-address': '',
      'email-template-subject': assignEmailTemplate.subject,
      'email-template-greeting': assignEmailTemplate.greeting,
      'email-template-body': assignEmailTemplate.body,
      'email-template-closing': assignEmailTemplate.closing,
    },
    remind: {
      'email-template-subject': remindEmailTemplate.subject,
      'email-template-greeting': remindEmailTemplate.greeting,
      'email-template-body': remindEmailTemplate.body,
      'email-template-closing': remindEmailTemplate.closing,
    },
    revoke: {
      'email-template-subject': revokeEmailTemplate.subject,
      'email-template-greeting': revokeEmailTemplate.greeting,
      'email-template-body': revokeEmailTemplate.body,
      'email-template-closing': revokeEmailTemplate.closing,
    },
  },
  assign: {
    'template-id': 0,
    'email-address': '',
    'template-name-select': '',
    'email-template-subject': assignEmailTemplate.subject,
    'email-template-greeting': assignEmailTemplate.greeting,
    'email-template-body': assignEmailTemplate.body,
    'email-template-closing': assignEmailTemplate.closing,
  },
  remind: {
    'template-id': 0,
    'template-name-select': '',
    'email-template-subject': remindEmailTemplate.subject,
    'email-template-greeting': remindEmailTemplate.greeting,
    'email-template-body': remindEmailTemplate.body,
    'email-template-closing': remindEmailTemplate.closing,
  },
  revoke: {
    'template-id': 0,
    'template-name-select': '',
    'email-template-subject': revokeEmailTemplate.subject,
    'email-template-greeting': revokeEmailTemplate.greeting,
    'email-template-body': revokeEmailTemplate.body,
    'email-template-closing': revokeEmailTemplate.closing,
  },
  allTemplates: [],
  subscribe: {
    'email-template-greeting': subscribeEmailTemplate.greeting,
    'email-template-body': subscribeEmailTemplate.body,
    'email-template-closing': subscribeEmailTemplate.closing,
  },
};

const emailTemplate = (state = initialState, action) => {
  switch (action.type) {
    case EMAIL_TEMPLATE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case EMAIL_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        allTemplates: action.payload.data.results,
      };
    case EMAIL_TEMPLATE_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    case SAVE_TEMPLATE_REQUEST:
      return {
        ...state,
        saving: true,
        error: null,
      };
    case SAVE_TEMPLATE_SUCCESS:
      return {
        ...state,
        saving: false,
        error: null,
        allTemplates: updateAllTemplates(action.payload.data, state),
      };
    case CURRENT_FROM_TEMPLATE:
      return {
        ...state,
        saving: false,
        error: null,
        ...transformTemplate(action.payload.emailType, action.payload.data),
      };
    case SAVE_TEMPLATE_FAILURE:
      return {
        ...state,
        saving: false,
        error: action.payload.error,
      };
    case SET_EMAIL_TEMPLATE_SOURCE:
      return {
        ...state,
        emailTemplateSource: action.payload.emailTemplateSource,
      };
    case SET_EMAIL_ADDRESS:
      return {
        ...state,
        saving: false,
        error: null,
        ...updateTemplateEmailAddress(action.payload.emailType, action.payload.emailAddress,
          state.default[action.payload.emailType]),
      };
    default:
      return state;
  }
};

export default emailTemplate;
