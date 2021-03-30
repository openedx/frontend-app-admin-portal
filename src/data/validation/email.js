import { SubmissionError } from 'redux-form';
import isEmail from 'validator/lib/isEmail';
import _ from 'lodash';
import { EMAIL_ADDRESS_TEXT_FORM_DATA, EMAIL_ADDRESS_CSV_FORM_DATA } from '../constants/addUsers';
import { EMAIL_TEMPLATE_FIELD_MAX_LIMIT, OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT, EMAIL_TEMPLATE_SUBJECT_KEY } from '../constants/emailTemplate';
import { mergeErrors } from '../../utils';

/* eslint-disable no-underscore-dangle */
const validateEmailTemplateFields = (formData, templateKey, isSubjectRequired = true) => {
  const errorsDict = {
    _error: [],
  };
  const emailSubject = formData[EMAIL_TEMPLATE_SUBJECT_KEY];

  const emailTemplateKey = formData[templateKey];

  if (!emailTemplateKey) {
    const message = 'An email template is required.';
    errorsDict[templateKey] = message;
    errorsDict._error.push(message);
  }
  if (isSubjectRequired && !emailSubject) {
    const message = 'No email subject provided. Please enter email subject.';
    errorsDict[EMAIL_TEMPLATE_SUBJECT_KEY] = message;
    errorsDict._error.push(message);
  }

  const templateErrorMessages = {
    'email-template-subject': {
      limit: OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT,
      message: `Email subject must be ${OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT} characters or less.`,
    },
    'email-template-greeting': {
      limit: EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
      message: `Email greeting must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`,
    },
    'email-template-closing': {
      limit: EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
      message: `Email closing must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`,
    },
  };

  Object.entries(templateErrorMessages).forEach(([key, { limit, message }]) => {
    if (formData[key] && formData[key].length > limit) {
      errorsDict[key] = message;
      errorsDict._error.push(message);
    }
  });

  return errorsDict;
};

const validateEmailAddresses = (emails) => {
  // Validates email addresses lists passed in as the argument.
  //
  // Returns an object with the following attributes.
  // validEmails: valid email addresses from the emails argument.
  // validEmailIndices: indices of the valid email addresses in the emails arguments.
  // invalidEmails: invalid email addresses from the emails argument.
  // invalidEmailIndices: indices of the invalid email addresses in the emails arguments.
  const result = {
    validEmails: [],
    validEmailIndices: [],
    invalidEmails: [],
    invalidEmailIndices: [],
  };
  if (!emails) {
    return result;
  }
  emails.forEach((email, index) => {
    if (email) {
      if (!isEmail(email)) {
        result.invalidEmails.push(email);
        result.invalidEmailIndices.push(index);
      } else {
        result.validEmails.push(email);
        result.validEmailIndices.push(index);
      }
    }
  });
  return result;
};

const validateEmailAddressesFields = (formData) => {
  // Validate that email address fields contain valid-looking emails.
  // Expects Redux form data
  // Returns an error object/dictionary
  const errorsDict = {
    _error: [],
  };

  const textAreaEmails = formData[EMAIL_ADDRESS_TEXT_FORM_DATA] && formData[EMAIL_ADDRESS_TEXT_FORM_DATA].split(/\r\n|\n/);
  const csvEmails = formData[EMAIL_ADDRESS_CSV_FORM_DATA];
  let {
    invalidEmailIndices,
  } = validateEmailAddresses(textAreaEmails || csvEmails);

  // 1 is added to every index to fix off-by-one error in messages shown to the user.
  invalidEmailIndices = invalidEmailIndices.map(i => i + 1);

  if (invalidEmailIndices.length > 0) {
    const lastEmail = invalidEmailIndices.pop();
    const message = `Email address on line ${invalidEmailIndices.join(', ')} \
${invalidEmailIndices.length !== 0 ? `and ${lastEmail}` : `${lastEmail}`} \
is invalid. Please try again.`;

    errorsDict[textAreaEmails ? EMAIL_ADDRESS_TEXT_FORM_DATA : EMAIL_ADDRESS_CSV_FORM_DATA] = message;
    errorsDict._error.push(message);
  }

  return errorsDict;
};

const validateEmailTemplateForm = (formData, templateKey, isSubjectRequired = true) => {
  // Takes redux form data and a string template key
  // Throws an error or otherwise returns nothing.
  const errorsDict = validateEmailTemplateFields(formData, templateKey, isSubjectRequired);

  if (Object.keys(errorsDict) > 1 || errorsDict._error.length > 0) {
    throw new SubmissionError(errorsDict);
  }
};

const validateEmailAddrTemplateForm = (formData, templateKey) => {
  // Takes Redux form data and a string template key.
  // Throws an error or otherwise returns nothing.

  // The 'subject' field is not required here.
  let errorsDict = validateEmailTemplateFields(formData, templateKey, false);
  if (!formData[EMAIL_ADDRESS_TEXT_FORM_DATA] && !formData[EMAIL_ADDRESS_CSV_FORM_DATA]) {
    const message = 'Either user emails or emails csv must be provided.';
    errorsDict[EMAIL_ADDRESS_TEXT_FORM_DATA] = message;
    errorsDict[EMAIL_ADDRESS_CSV_FORM_DATA] = message;
    errorsDict._error.push(message);
  }
  const emailFieldErrors = validateEmailAddressesFields(formData);
  errorsDict = mergeErrors(errorsDict, emailFieldErrors);
  if (errorsDict._error.length > 0) {
    throw new SubmissionError(errorsDict);
  }
};

const returnValidatedEmails = (formData) => {
  // Takes Redux form data as a parameter
  // raises a Submission error or otherwise returns a list of valid emails.
  const errorsDict = validateEmailAddressesFields(formData);
  if (!formData[EMAIL_ADDRESS_TEXT_FORM_DATA] && !formData[EMAIL_ADDRESS_CSV_FORM_DATA]) {
    const message = 'Either user emails or emails csv must be provided.';
    errorsDict[EMAIL_ADDRESS_TEXT_FORM_DATA] = message;
    errorsDict[EMAIL_ADDRESS_CSV_FORM_DATA] = message;
    errorsDict._error.push(message);
  }

  if (errorsDict._error.length > 0) {
    throw new SubmissionError(errorsDict);
  }
  let emails = [];
  if (formData[EMAIL_ADDRESS_TEXT_FORM_DATA] && formData[EMAIL_ADDRESS_TEXT_FORM_DATA].length) {
    emails.push(...formData[EMAIL_ADDRESS_TEXT_FORM_DATA].split(/\r\n|\n/));
  }
  if (formData[EMAIL_ADDRESS_CSV_FORM_DATA] && formData[EMAIL_ADDRESS_CSV_FORM_DATA].length) {
    emails.push(...formData[EMAIL_ADDRESS_CSV_FORM_DATA]);
  }
  emails = _.union(emails); // Dedup emails
  return validateEmailAddresses(emails).validEmails;
};
/* eslint-enable no-underscore-dangle */

export {
  validateEmailAddresses,
  validateEmailAddressesFields,
  validateEmailTemplateForm,
  validateEmailAddrTemplateForm,
  returnValidatedEmails,
  validateEmailTemplateFields,
};
