import { csvFileKey, textAreaKey } from './constants';

export const getTooManyAssignmentsMessage = ({
  isCsv = false,
  emails,
  numCodes,
  selected,
}) => {
  let message = `You have ${numCodes}`;

  message += ` ${numCodes > 1 ? 'codes' : 'code'}`;
  message += ` ${selected ? 'selected' : 'remaining'}`;
  message += `, but ${isCsv ? 'your file has' : 'you entered'}`;
  message += ` ${emails.length} emails. Please try again.`;

  return message;
};

export const getInvalidEmailMessage = (invalidEmailIndices, emails) => {
  const firstInvalidIndex = [...invalidEmailIndices].shift();
  const invalidEmail = emails[firstInvalidIndex];
  const message = `Email address ${invalidEmail} on line ${firstInvalidIndex + 1} is invalid. Please try again.`;
  return message;
};

export const NO_EMAIL_ADDRESS_ERROR = 'No email addresses provided. Either manually enter email addresses or upload a CSV file.';
export const BOTH_TEXT_AREA_AND_CSV_ERROR = 'You uploaded a CSV and manually entered email addresses. Please only use one of these fields.';

export const getErrors = ({
  invalidTextAreaEmails = [], textAreaEmails = [], validTextAreaEmails = [],
  unassignedCodes, numberOfSelectedCodes, shouldValidateSelectedCodes,
  invalidCsvEmails = [], csvEmails = [], validCsvEmails = [],
}) => {
  const errors = {
    _error: [],
  };

  /* eslint-disable no-underscore-dangle */
  if (validTextAreaEmails.length === 0 && validCsvEmails.length === 0) {
    errors._error.push(NO_EMAIL_ADDRESS_ERROR);
    return errors;
  }

  if (validTextAreaEmails.length > 0 && validCsvEmails.length > 0) {
    errors._error.push(BOTH_TEXT_AREA_AND_CSV_ERROR);
    return errors;
  }

  if (validTextAreaEmails.length > 0) {
    if (invalidTextAreaEmails.length > 0) {
      const invalidEmailMessage = getInvalidEmailMessage(invalidTextAreaEmails, textAreaEmails);
      errors[textAreaKey] = invalidEmailMessage;
      errors._error.push(invalidEmailMessage);
    } else if (validTextAreaEmails.length > unassignedCodes) {
      const message = getTooManyAssignmentsMessage({
        emails: validTextAreaEmails,
        numCodes: unassignedCodes,
      });
      errors[textAreaKey] = message;
      errors._error.push(message);
    } else if (
      numberOfSelectedCodes && shouldValidateSelectedCodes
      && validTextAreaEmails.length > numberOfSelectedCodes
    ) {
      const message = getTooManyAssignmentsMessage({
        emails: validTextAreaEmails,
        numCodes: numberOfSelectedCodes,
        selected: true,
      });
      errors[textAreaKey] = message;
      errors._error.push(message);
    }
    return errors;
  }

  if (invalidCsvEmails.length > 0) {
    const invalidEmailMessage = getInvalidEmailMessage(invalidCsvEmails, csvEmails);
    errors[csvFileKey] = invalidEmailMessage;
    errors._error.push(invalidEmailMessage);
  } else if (validCsvEmails.length > unassignedCodes) {
    const message = getTooManyAssignmentsMessage({
      isCsv: true,
      emails: validCsvEmails,
      numCodes: unassignedCodes,
    });
    errors[csvFileKey] = message;
    errors._error.push(message);
  } else if (
    numberOfSelectedCodes && shouldValidateSelectedCodes
    && validCsvEmails.length > numberOfSelectedCodes
  ) {
    const message = getTooManyAssignmentsMessage({
      isCsv: true,
      emails: validCsvEmails,
      numCodes: numberOfSelectedCodes,
      selected: true,
    });
    errors[csvFileKey] = message;
    errors._error.push(message);
  }

  return errors;
};
