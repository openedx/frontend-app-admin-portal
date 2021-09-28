import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
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

export const EMAIL_FORM_NAME = 'Email Template';
export const EMAIL_TEMPLATE_FIELDS = {
  [EMAIL_TEMPLATE_SUBJECT_ID]: {
    name: EMAIL_TEMPLATE_SUBJECT_ID,
    component: RenderField,
    label: 'Customize email subject',
    type: 'text',
    limit: OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT,
    'data-hj-suppress': true,
  },
  [EMAIL_TEMPLATE_GREETING_ID]: {
    name: EMAIL_TEMPLATE_GREETING_ID,
    component: TextAreaAutoSize,
    label: 'Customize greeting',
    limit: EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
    'data-hj-suppress': true,
  },
  [EMAIL_TEMPLATE_BODY_ID]: {
    name: EMAIL_TEMPLATE_BODY_ID,
    component: TextAreaAutoSize,
    label: 'Body',
    disabled: true,
    'data-hj-suppress': true,
  },
  [EMAIL_TEMPLATE_CLOSING_ID]: {
    name: EMAIL_TEMPLATE_CLOSING_ID,
    component: TextAreaAutoSize,
    label: 'Customize closing',
    limit: EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
    'data-hj-suppress': true,
  },
  ...(features.FILE_ATTACHMENT && {
    [EMAIL_TEMPLATE_FILES_ID]: {
      name: EMAIL_TEMPLATE_FILES_ID,
      component: MultipleFileInputField,
      type: 'file',
      label: 'add files',
      value: [],
      description: "Max files size shouldn't exceed 2mb.",
    },
  }),
};

const EmailTemplateForm = ({
  children, emailTemplateType, fields, currentEmail, disabled,
}) => (
  <form onSubmit={e => e.preventDefault()}>
    <div className="mt-4">
      <h3>{EMAIL_FORM_NAME}</h3>
      <TemplateSourceFields emailTemplateType={emailTemplateType} currentEmail={currentEmail} disabled={disabled} />
      {Object.values(fields).map(fieldProps => <Field key={fieldProps.name} disabled={disabled} {...fieldProps} />)}
      {children}
    </div>
  </form>
);

EmailTemplateForm.defaultProps = {
  children: null,
  fields: EMAIL_TEMPLATE_FIELDS,
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
