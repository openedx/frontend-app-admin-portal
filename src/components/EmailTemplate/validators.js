import {
  EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
  EMAIL_SUBJECT_LIMIT,
} from './constants';

export const validateNotEmpty = (value, message = 'Required, a value must be provided.') => {
  if (!value) {
    return { isValid: false, message };
  }

  return { isValid: true, message: '' };
};

export const validateSubject = (value) => {
  if (value.length > EMAIL_SUBJECT_LIMIT) {
    return { isValid: false, message: `Email subject must be ${EMAIL_SUBJECT_LIMIT} characters or less.` };
  }

  return { isValid: true, message: '' };
};

export const validateTemplateField = (value, fieldName) => {
  const templateErrorMessages = {
    'email-template-greeting': `Email greeting must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`,
    'email-template-closing': `Email closing must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`,
  };

  if (value.length > EMAIL_TEMPLATE_FIELD_MAX_LIMIT) {
    return { isValid: false, message: templateErrorMessages[fieldName] };
  }

  return { isValid: true, message: '' };
};

export const validateEmailTemplateData = (emailTemplate, isNewTemplate) => {
  const errors = [];

  if (isNewTemplate && !emailTemplate['subscription-template-name']) {
    errors.push('No template name provided, please provide an email template name.');
  }

  if (!emailTemplate['email-template-subject']) {
    errors.push('No email subject provided, please provide an email subject.');
  } else {
    const result = validateSubject(emailTemplate['email-template-subject']);
    if (!result.isValid) {
      errors.push(result.message);
    }
  }

  let result = validateTemplateField(emailTemplate['email-template-greeting'], 'email-template-greeting');
  if (!result.isValid) {
    errors.push(result.message);
  }
  result = validateTemplateField(emailTemplate['email-template-closing'], 'email-template-closing');
  if (!result.isValid) {
    errors.push(result.message);
  }
  return errors;
};
