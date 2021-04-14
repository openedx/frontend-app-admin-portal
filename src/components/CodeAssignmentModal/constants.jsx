import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { MODAL_TYPES } from '../EmailTemplateForm/constants';
import { EMAIL_TEMPLATE_FIELDS } from '../EmailTemplateForm';
import CheckboxWithTooltip from '../ReduxFormCheckbox/CheckboxWithTooltip';

export const ASSIGNMENT_ERROR_TITLES = {
  [MODAL_TYPES.assign]: 'Unable to assign codes',
  [MODAL_TYPES.save]: 'Unable to save template',
};
export const EMAIL_TEMPLATE_NUDGE_EMAIL_ID = 'enable-nudge-emails';

export const ASSIGNMENT_MODAL_FIELDS = {
  ...EMAIL_TEMPLATE_FIELDS,
  [EMAIL_TEMPLATE_NUDGE_EMAIL_ID]: {
    name: EMAIL_TEMPLATE_NUDGE_EMAIL_ID,
    id: EMAIL_TEMPLATE_NUDGE_EMAIL_ID,
    component: CheckboxWithTooltip,
    className: 'auto-reminder-wrapper',
    icon: faInfoCircle,
    altText: 'More information',
    tooltipText: 'edX will remind learners to redeem their code 3, 10, and 19 days after you assign it.',
    label: 'Automate reminders',
  },
};
