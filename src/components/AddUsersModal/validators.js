import { SubmissionError } from 'redux-form';

import { EMAIL_ADDRESS_CSV_FORM_DATA, EMAIL_ADDRESS_TEXT_FORM_DATA } from '../../data/constants/addUsers';
import { mergeErrors, validateEmailAddressesFields } from '../../utils';
import { validateEmailTemplateData } from '../EmailTemplate/validators';

// eslint-disable-next-line import/prefer-default-export
export const validateFormData = (formData, emailTemplateData) => {
  const userEmailsKey = EMAIL_ADDRESS_TEXT_FORM_DATA;
  const emailsCSVKey = EMAIL_ADDRESS_CSV_FORM_DATA;

  /* eslint-disable no-underscore-dangle */
  let errors = {
    _error: [],
  };

  // The 'name' field is not required here,
  // so we run validations as if an existing template is being processed.
  const emailTemplateErrors = validateEmailTemplateData(emailTemplateData, false);
  errors._error.push(...emailTemplateErrors);

  if (!formData[userEmailsKey] && !formData[emailsCSVKey]) {
    const message = 'Either user emails or emails csv must be provided.';
    errors[userEmailsKey] = message;
    errors[emailsCSVKey] = message;
    errors._error.push(message);
  }

  const emailFieldErrors = validateEmailAddressesFields(formData);
  errors = mergeErrors(errors, emailFieldErrors);

  if (errors._error.length > 0) {
    throw new SubmissionError(errors);
  }
  /* eslint-enable no-underscore-dangle */
};
