import {
  EMAIL_TEMPLATE_SUCCESS,
  EMAIL_TEMPLATE_REQUEST,
  EMAIL_TEMPLATE_FAILURE,
} from '../constants/emailTemplate';

import { transformTemplates } from '../../utils';
import assignEmailTemplate from '../../components/CodeAssignmentModal/emailTemplate';
import remindEmailTemplate from '../../components/CodeReminderModal/emailTemplate';
import revokeEmailTemplate from '../../components/CodeRevokeModal/emailTemplate';

const initialState = {
  loading: false,
  error: null,
  assign: {
    'email-template-greeting': assignEmailTemplate.greeting,
    'email-template-body': assignEmailTemplate.body,
    'email-template-closing': assignEmailTemplate.closing,
  },
  remind: {
    'email-template-greeting': remindEmailTemplate.greeting,
    'email-template-body': remindEmailTemplate.body,
    'email-template-closing': remindEmailTemplate.closing,
  },
  revoke: {
    'email-template-greeting': revokeEmailTemplate.greeting,
    'email-template-body': revokeEmailTemplate.body,
    'email-template-closing': revokeEmailTemplate.closing,
  },
};

const emailTemplate = (state = initialState, action) => {
  switch (action.type) {
    case EMAIL_TEMPLATE_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case EMAIL_TEMPLATE_SUCCESS:
      return {
        loading: false,
        error: null,
        ...transformTemplates(action.payload.data, initialState),
      };
    case EMAIL_TEMPLATE_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default emailTemplate;
