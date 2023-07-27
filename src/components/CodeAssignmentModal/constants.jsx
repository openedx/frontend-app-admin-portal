import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { MODAL_TYPES } from '../EmailTemplateForm/constants';
import { getTemplateEmailFields } from '../EmailTemplateForm';
import CheckboxWithTooltip from '../ReduxFormCheckbox/CheckboxWithTooltip';

import messages from './messages';

export const ASSIGNMENT_ERROR_TITLES = {
  [MODAL_TYPES.assign]: 'Unable to assign codes',
  [MODAL_TYPES.save]: 'Unable to save template',
};
export const EMAIL_TEMPLATE_NUDGE_EMAIL_ID = 'enable-nudge-emails';

export const getAssignmentModalFields = formatMessage => {
  const emailTemplateFields = getTemplateEmailFields(formatMessage);
  return {
    ...emailTemplateFields,
    [EMAIL_TEMPLATE_NUDGE_EMAIL_ID]: {
      name: EMAIL_TEMPLATE_NUDGE_EMAIL_ID,
      id: EMAIL_TEMPLATE_NUDGE_EMAIL_ID,
      component: CheckboxWithTooltip,
      className: 'auto-reminder-wrapper',
      icon: faInfoCircle,
      altText: formatMessage(messages.modalAltText),
      tooltipText: formatMessage(messages.modalTooltipText),
      label: formatMessage(messages.modalFieldLabel),
      defaultChecked: true,
    },
  };
};

export const NOTIFY_LEARNERS_CHECKBOX_TEST_ID = 'notify-learners-checkbox';
export const SUBMIT_BUTTON_TEST_ID = 'submit-button';
