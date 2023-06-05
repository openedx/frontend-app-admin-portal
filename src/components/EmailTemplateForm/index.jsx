import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { useIntl } from '@edx/frontend-platform/i18n';
import TemplateSourceFields from '../../containers/TemplateSourceFields';
import TextAreaAutoSize from '../TextAreaAutoSize';
import RenderField from '../RenderField';
import MultipleFileInputField from '../MultipleFileInputField/MultipleFileInputField';
import { features } from '../../config';
import {
  MODAL_TYPES,
  EMAIL_TEMPLATE_GREETING_ID,
  EMAIL_TEMPLATE_SUBJECT_ID,
  EMAIL_TEMPLATE_BODY_ID,
  EMAIL_TEMPLATE_CLOSING_ID,
  EMAIL_TEMPLATE_FILES_ID,
} from './constants';
import { EMAIL_TEMPLATE_FIELD_MAX_LIMIT, OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT } from '../../data/constants/emailTemplate';

import messages from './messages';

export const getTemplateEmailFields = (formatMessage) => ({
  [EMAIL_TEMPLATE_SUBJECT_ID]: {
    name: EMAIL_TEMPLATE_SUBJECT_ID,
    component: RenderField,
    label: formatMessage(messages.emailCustomizeSubject),
    type: 'text',
    limit: OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT,
    'data-hj-suppress': true,
  },
  [EMAIL_TEMPLATE_GREETING_ID]: {
    name: EMAIL_TEMPLATE_GREETING_ID,
    component: TextAreaAutoSize,
    label: formatMessage(messages.emailCustomizeGreeting),
    limit: EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
    'data-hj-suppress': true,
  },
  [EMAIL_TEMPLATE_BODY_ID]: {
    name: EMAIL_TEMPLATE_BODY_ID,
    component: TextAreaAutoSize,
    label: formatMessage(messages.emailBody),
    disabled: true,
    'data-hj-suppress': true,
  },
  [EMAIL_TEMPLATE_CLOSING_ID]: {
    name: EMAIL_TEMPLATE_CLOSING_ID,
    component: TextAreaAutoSize,
    label: formatMessage(messages.emailCustomizeClosing),
    limit: EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
    'data-hj-suppress': true,
  },
  ...(features.FILE_ATTACHMENT && {
    [EMAIL_TEMPLATE_FILES_ID]: {
      name: EMAIL_TEMPLATE_FILES_ID,
      component: MultipleFileInputField,
      type: 'file',
      label: formatMessage(messages.emailAddFiles),
      value: [],
      description: formatMessage(messages.emailMaxFileSizeMessage),
    },
  }),
});

const EmailTemplateForm = ({
  children, emailTemplateType, fields, currentEmail, disabled,
}) => {
  const { formatMessage } = useIntl();
  const fieldsWithDefault = fields || getTemplateEmailFields(formatMessage);

  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="mt-4">
        <h3>{formatMessage(messages.emailFormName)}</h3>
        <TemplateSourceFields emailTemplateType={emailTemplateType} currentEmail={currentEmail} disabled={disabled} />
        {Object.values(fieldsWithDefault).map(fieldProps => (
          <Field key={fieldProps.name} disabled={disabled} {...fieldProps} />
        ))}
        {children}
      </div>
    </form>
  );
};

EmailTemplateForm.defaultProps = {
  children: null,
  fields: null,
  currentEmail: '',
  disabled: false,
};

EmailTemplateForm.propTypes = {
  emailTemplateType: PropTypes.oneOf(Object.values(MODAL_TYPES)).isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  fields: PropTypes.shape(),
  currentEmail: PropTypes.string,
  disabled: PropTypes.bool,
};

export default EmailTemplateForm;
