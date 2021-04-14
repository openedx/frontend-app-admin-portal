import { EMAIL_ADDRESS_CSV_FORM_DATA, EMAIL_ADDRESS_TEXT_FORM_DATA } from '../../data/constants/addUsers';
import {
  getTooManyAssignmentsMessage, getInvalidEmailMessage, getErrors,
  NO_EMAIL_ADDRESS_ERROR, BOTH_TEXT_AREA_AND_CSV_ERROR,
} from './validation';

describe('getTooManyAssignmentsMessage', () => {
  it('displays the number of codes', () => {
    const result = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com'],
      numCodes: 10,
      selected: false,
    });
    expect(result).toContain('You have 10');
  });
  it('pluralizes codes correctly', () => {
    const resultPlural = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com'],
      numCodes: 10,
      selected: false,
    });
    const resultSingular = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com'],
      numCodes: 1,
      selected: false,
    });
    expect(resultPlural).toContain('codes ');
    expect(resultSingular).toContain('code ');
  });
  it('shows selected or remaining codes', () => {
    const resultRemaining = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com'],
      numCodes: 10,
      selected: false,
    });
    const resultSelected = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com'],
      numCodes: 1,
      selected: true,
    });
    expect(resultRemaining).toContain('remaining');
    expect(resultSelected).toContain('selected');
  });
  it('gives the correct csv info', () => {
    const resultCSV = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com'],
      numCodes: 10,
      selected: false,
      isCsv: true,
    });
    const resultNoCSV = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com'],
      numCodes: 10,
      selected: false,
    });
    expect(resultCSV).toContain('your file has');
    expect(resultNoCSV).toContain('you entered');
  });
  it('has the correct email length', () => {
    const resultNoCSV = getTooManyAssignmentsMessage({
      emails: ['foo@bar.com', 'bears@bearmountain.com'],
      numCodes: 10,
      selected: false,
    });
    expect(resultNoCSV).toContain('2 emails');
  });
});
describe('getInvalidEmailMessage', () => {
  it('returns a message with the invalid email address', () => {
    const badEmail = 'bad@winnie.horse';
    const result = getInvalidEmailMessage([2, 5], ['good@nico.horse', 'nice@donkey.com', badEmail, 'awesome@mule.com']);
    expect(result).toContain(badEmail);
  });
  it('returns the line number of the email', () => {
    const badIndex = 1;
    const result = getInvalidEmailMessage([badIndex, 5], ['good@nico.horse', 'nice@donkey.com', 'awesome@mule.com']);
    expect(result).toContain(`line ${badIndex + 1}`);
  });
});
describe('getErrors', () => {
  const sampleInputCsv = {
    unassignedCodes: 1,
    numberOfSelectedCodes: 1,
    shouldValidateSelectedCodes: true,
    invalidCsvEmails: [0],
    validCsvEmails: ['another@me.com', 'yetOneMore@me.com'],
    csvEmails: ['you@you.com', 'onemore@horse.com'],
  };
  const sampleInputTextArea = {
    invalidTextAreaEmails: [1],
    textAreaEmails: ['me@me.com', 'foo@bar.com'],
    validTextAreaEmails: ['foo@bar.com', 'sue@bear.com'],
    ...sampleInputCsv,
    validCsvEmails: [],
  };
  it('returns an invalid email message for text area emails', () => {
    const result = getErrors(sampleInputTextArea);
    const errorMessage = getInvalidEmailMessage(
      sampleInputTextArea.invalidTextAreaEmails, sampleInputTextArea.textAreaEmails,
    );
    const expected = {
      [EMAIL_ADDRESS_TEXT_FORM_DATA]: errorMessage,
      _error: [errorMessage],
    };
    expect(result).toEqual(expected);
  });
  it('returns an too many assignments message for the text area', () => {
    const result = getErrors({ ...sampleInputTextArea, invalidTextAreaEmails: [] });
    const errorMessage = getTooManyAssignmentsMessage({
      emails: sampleInputTextArea.validTextAreaEmails, numCodes: sampleInputTextArea.unassignedCodes,
    });
    const expected = {
      [EMAIL_ADDRESS_TEXT_FORM_DATA]: errorMessage,
      _error: [errorMessage],
    };
    expect(result).toEqual(expected);
  });
  it('returns too many assignments message when there are too many valid emails (text area)', () => {
    const result = getErrors({ ...sampleInputTextArea, invalidTextAreaEmails: [], unassignedCodes: 2 });
    const errorMessage = getTooManyAssignmentsMessage({
      emails: sampleInputTextArea.validTextAreaEmails,
      numCodes: sampleInputTextArea.numberOfSelectedCodes,
      selected: true,
    });
    const expected = {
      [EMAIL_ADDRESS_TEXT_FORM_DATA]: errorMessage,
      _error: [errorMessage],
    };
    expect(result).toEqual(expected);
  });
  it('returns an invalid email message if there are invalid CSV emails', () => {
    const result = getErrors({ ...sampleInputCsv, unassignedCodes: 2 });
    const errorMessage = getInvalidEmailMessage(sampleInputTextArea.invalidCsvEmails, sampleInputTextArea.csvEmails);
    const expected = {
      [EMAIL_ADDRESS_CSV_FORM_DATA]: errorMessage,
      _error: [errorMessage],
    };
    expect(result).toEqual(expected);
  });
  it('returns too many assignments message for csv emails when there are more emails than codes', () => {
    const result = getErrors({ ...sampleInputCsv, invalidCsvEmails: [] });
    const errorMessage = getTooManyAssignmentsMessage({
      isCsv: true,
      emails: sampleInputCsv.validCsvEmails,
      numCodes: sampleInputCsv.unassignedCodes,
    });
    const expected = {
      [EMAIL_ADDRESS_CSV_FORM_DATA]: errorMessage,
      _error: [errorMessage],
    };
    expect(result).toEqual(expected);
  });
  it('returns too many assignments message for csv when there are more emails than selected codes', () => {
    const result = getErrors({
      ...sampleInputCsv, unassignedCodes: 2, invalidCsvEmails: [], selectedCodes: 3,
    });
    const errorMessage = getTooManyAssignmentsMessage({
      emails: sampleInputCsv.validCsvEmails,
      numCodes: sampleInputCsv.numberOfSelectedCodes,
      selected: true,
      isCsv: true,
    });
    const expected = {
      [EMAIL_ADDRESS_CSV_FORM_DATA]: errorMessage,
      _error: [errorMessage],
    };
    expect(result).toEqual(expected);
  });
  it('returns a no email addreses error if there are no email addresses', () => {
    const result = getErrors({ validTextAreaEmails: [], validCsvEmails: [] });
    expect(result).toEqual({ _error: [NO_EMAIL_ADDRESS_ERROR] });
  });
  it('returns an error if both text area and csv have emails', () => {
    const result = getErrors({ validTextAreaEmails: ['foo'], validCsvEmails: ['bar'] });
    expect(result).toEqual({ _error: [BOTH_TEXT_AREA_AND_CSV_ERROR] });
  });
});
