import _ from 'lodash';
import {
  validateEmailAddresses,
  validateEmailAddressesFields,
  validateEmailTemplateFields,
  validateEmailTemplateForm,
  validateEmailAddrTemplateForm,
  returnValidatedEmails,
} from './email';
import { EMAIL_ADDRESS_TEXT_FORM_DATA, EMAIL_ADDRESS_CSV_FORM_DATA } from '../constants/addUsers';
import { EMAIL_TEMPLATE_SUBJECT_KEY, OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT } from '../constants/emailTemplate';

describe('email validation', () => {
  const templateKey = 'template-body';

  describe('validate email addresses', () => {
    const baseResults = {
      validEmails: [],
      validEmailIndices: [],
      invalidEmails: [],
      invalidEmailIndices: [],
    };
    it('returns valid email addresses and indices', () => {
      const validEmails = ['timmy@test.co', 'bigsby@test.co', 'coolstorybro@gtest.com'];
      const expectedResult = { ...baseResults };
      expectedResult.validEmails = validEmails;
      expectedResult.validEmailIndices = _.range(validEmails.length);
      expect(validateEmailAddresses(validEmails)).toEqual(expectedResult);
    });

    it('returns invalid email addresses and indices', () => {
      const invalidEmails = ['bobbyb', 'yooooooo3.a.x.y', 'argh@', 'blargh@.co.uk'];
      const expectedResult = { ...baseResults };
      expectedResult.invalidEmails = invalidEmails;
      expectedResult.invalidEmailIndices = _.range(invalidEmails.length);
      expect(validateEmailAddresses(invalidEmails)).toEqual(expectedResult);
    });

    it('returns both valid and invalid email addresses', () => {
      const mixedEmails = ['chester@stuff.co.uk', 'ayyylmao@test', 'dope_sniper_420@xy.x.x.x', 'alice@example.com'];
      const expectedResult = { ...baseResults };
      expectedResult.validEmails = [mixedEmails[0], mixedEmails[3]];
      expectedResult.validEmailIndices = [0, 3];
      expectedResult.invalidEmails = [mixedEmails[1], mixedEmails[2]];
      expectedResult.invalidEmailIndices = [1, 2];
      expect(validateEmailAddresses(mixedEmails)).toEqual(expectedResult);
    });

    it('returns empty dict if no emails are present', () => {
      expect(validateEmailAddresses()).toEqual(baseResults);
    });
  });

  describe('validate email address fields', () => {
    it('returns improperly formatted text field emails as errors', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_TEXT_FORM_DATA] = 'darkness@test\npretty_butterfly.co\nbobbytables@test.com';
      const expectedMessage = 'Email address on line 1 and 2 is invalid. Please try again.';
      const expectedResult = {
        _error: [expectedMessage],
        [EMAIL_ADDRESS_TEXT_FORM_DATA]: expectedMessage,
      };
      expect(validateEmailAddressesFields(formData)).toEqual(expectedResult);
    });

    it('returns improperly formatted csv emails as errors', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = ['darkness@test', 'bobbytables@test.com', 'pretty_butterfly.co'];
      const expectedMessage = 'Email address on line 1 and 3 is invalid. Please try again.';
      const expectedResult = {
        _error: [expectedMessage],
        [EMAIL_ADDRESS_CSV_FORM_DATA]: expectedMessage,
      };

      expect(validateEmailAddressesFields(formData)).toEqual(expectedResult);
    });

    it('returns blank error dict if no csv email errors are found', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = ['alice@gtest.com', 'bobbbbbb@testing.co.uk'];
      expect(validateEmailAddressesFields(formData)).toEqual({ _error: [] });
    });

    it('returns blank error dict if no text email errors are found', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_TEXT_FORM_DATA] = 'alice@gtest.com\nbobbbbb@testing.co.uk';
      expect(validateEmailAddressesFields(formData)).toEqual({ _error: [] });
    });
  });

  describe('validate email template fields', () => {
    it('returns error if template key not found in form data', () => {
      const formData = new FormData();
      const expectedResult = {
        _error: ['An email template is required.'],
        [templateKey]: 'An email template is required.',
      };
      formData[EMAIL_TEMPLATE_SUBJECT_KEY] = 'Course Redemption';
      expect(validateEmailTemplateFields(formData, templateKey)).toEqual(expectedResult);
    });

    it('returns error if no subject provided (and subject is required)', () => {
      const formData = new FormData();
      const expectedResult = {
        _error: ['No email subject provided. Please enter email subject.'],
        [EMAIL_TEMPLATE_SUBJECT_KEY]: 'No email subject provided. Please enter email subject.',
      };
      formData[templateKey] = 'Course Redemption Email Template';
      expect(validateEmailTemplateFields(formData, templateKey)).toEqual(expectedResult);
    });

    it('returns template length limit exceeded errors if fields are too long', () => {
      const formData = new FormData();
      const expectedResult = {
        _error: [`Email subject must be ${OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT} characters or less.`],
        [EMAIL_TEMPLATE_SUBJECT_KEY]: `Email subject must be ${OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT} characters or less.`,
      };
      formData[EMAIL_TEMPLATE_SUBJECT_KEY] = `${'a'.repeat(OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT + 5)}`;
      formData[templateKey] = 'Template Test1';

      expect(validateEmailTemplateFields(formData, templateKey)).toEqual(expectedResult);
    });

    it('can return multiple errors properly formatted', () => {
      const formData = new FormData();
      const expectedResult = {
        _error: ['An email template is required.', 'No email subject provided. Please enter email subject.'],
        [EMAIL_TEMPLATE_SUBJECT_KEY]: 'No email subject provided. Please enter email subject.',
        [templateKey]: 'An email template is required.',
      };

      expect(validateEmailTemplateFields(formData, templateKey)).toEqual(expectedResult);
    });

    it('returns object with empty array on successful validation (and no subject is required)', () => {
      const formData = new FormData();
      const expectedResult = { _error: [] };
      formData[templateKey] = 'Template Test';
      expect(validateEmailTemplateFields(formData, templateKey, false)).toEqual(expectedResult);
    });

    it('returns object with empty array on successful validation', () => {
      const formData = new FormData();
      const expectedResult = { _error: [] };
      formData[templateKey] = 'Template Test';
      formData[EMAIL_TEMPLATE_SUBJECT_KEY] = 'Template Subject';
      expect(validateEmailTemplateFields(formData, templateKey)).toEqual(expectedResult);
    });
  });

  describe('validate email template form', () => {
    it('raises submission error if template field validation returns errors', () => {
      const formData = new FormData();
      expect(() => { validateEmailTemplateForm(formData, templateKey); }).toThrow('Submit Validation Failed');
    });

    it('returns nothing on successful validation', () => {
      const formData = new FormData();
      formData[templateKey] = 'Template Name';
      formData[EMAIL_TEMPLATE_SUBJECT_KEY] = 'Subject';
      expect(validateEmailTemplateForm(formData, templateKey)).toBeUndefined();
    });

    it('returns nothing on successful validation (and no subject is required)', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = ['bobby1@test.com', 'bobby2@test.com'];
      formData[templateKey] = 'Template 1';
      expect(validateEmailTemplateForm(formData, templateKey, false)).toBeUndefined();
    });
  });

  describe('validate email address and template form', () => {
    it('raises submission error if template and email validation return errors', () => {
      const formData = new FormData();
      formData[EMAIL_TEMPLATE_SUBJECT_KEY] = 'Test Subject';

      let thrownError;
      try {
        validateEmailAddrTemplateForm(formData, templateKey);
      } catch (error) {
        thrownError = error;
      }
      const expectedError = {
        _error: ['An email template is required.', 'Either user emails or emails csv must be provided.'],
        [EMAIL_ADDRESS_CSV_FORM_DATA]: 'Either user emails or emails csv must be provided.',
        [EMAIL_ADDRESS_TEXT_FORM_DATA]: 'Either user emails or emails csv must be provided.',
        [templateKey]: 'An email template is required.',
      };
      expect(thrownError.errors).toMatchObject(expectedError);
    });

    it('returns nothing on successful validation', () => {
      const formData = new FormData();
      formData[EMAIL_TEMPLATE_SUBJECT_KEY] = 'Test Subject';
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = ['bobby1@test.com', 'bobby2@test.com'];
      formData[templateKey] = 'Template 1';
      expect(validateEmailAddrTemplateForm(formData, templateKey)).toBeUndefined();
    });
  });

  describe('validate email address fields and return options', () => {
    it('raises submission error if no email addresses are provided', () => {
      const formData = new FormData();

      let thrownError;
      try {
        returnValidatedEmails(formData);
      } catch (error) {
        thrownError = error;
      }
      const expectedError = {
        _error: ['Either user emails or emails csv must be provided.'],
        [EMAIL_ADDRESS_CSV_FORM_DATA]: 'Either user emails or emails csv must be provided.',
        [EMAIL_ADDRESS_TEXT_FORM_DATA]: 'Either user emails or emails csv must be provided.',
      };
      expect(thrownError.errors).toMatchObject(expectedError);
    });

    it('dedupes overlapping email addresses', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_TEXT_FORM_DATA] = 'bobbyb@test.com\nalice@test.com\nalice@test.com';
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = ['cthulu@lkerwjrwlke.com', 'bobbyb@test.com'];
      expect(returnValidatedEmails(formData).sort()).toEqual(
        ['bobbyb@test.com', 'alice@test.com', 'cthulu@lkerwjrwlke.com'].sort(),
      );
    });
  });
});
