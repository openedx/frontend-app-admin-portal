import { range } from 'lodash-es';
import {
  extractSalesforceIds,
  returnValidatedEmails,
  validateEmailAddresses,
  validateEmailAddressesFields,
  validateEmailAddrTemplateForm,
  validateEmailTemplateFields,
  validateEmailTemplateForm,
} from './email';
import { EMAIL_ADDRESS_CSV_FORM_DATA, EMAIL_ADDRESS_TEXT_FORM_DATA } from '../constants/addUsers';
import { EMAIL_TEMPLATE_SUBJECT_KEY, OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT } from '../constants/emailTemplate';

const hasFormatChar = (str) => [...str].some(char => {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x200c && code <= 0x200f) // ZWNJ, ZWJ, LRM, RLM
          || (code >= 0x202a && code <= 0x202e) // LRE–RLO, PDF
          || (code >= 0x2066 && code <= 0x2069) // LRI–PDI
  );
});

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
      expectedResult.validEmailIndices = range(validEmails.length);
      expect(validateEmailAddresses(validEmails)).toEqual(expectedResult);
    });

    it('returns valid email addresses and indices when whitespace padding is in the picture', () => {
      const validEmails = ['timmy@test.co ', ' bigsby@test.co', 'coolstorybro@gtest.com   '];
      const expectedResult = { ...baseResults };
      expectedResult.validEmails = ['timmy@test.co', 'bigsby@test.co', 'coolstorybro@gtest.com'];
      expectedResult.validEmailIndices = range(validEmails.length);
      expect(validateEmailAddresses(validEmails)).toEqual(expectedResult);
    });

    it('returns valid email addresses and indices when various unicode formatting is in the picture', () => {
      const unicodeEmails = [
        'dave.smith@\u200Fexample.com', // RLM after @
        'john.doe@test.\u200Ecom', // LRM after '.' in domain
        'alex\u200Ddoe@somewhere.com', // ZWJ between letters in local part
        'sam\u200C@example.net', // ZWNJ at end of local part
        '\u202Aalice@example.org', // LRE at start of address
        'kate.jones@domain\u202B.com', // RLE before '.' in domain
        'roger+\u202Csales@company.com', // PDF after '+' in local part
        'chris@exa\u202Dmple.com', // LRO in domain name
        'mary@contoso.com\u202E', // RLO at end of address
        'anna\u2066.smith@mysite.com', // LRI before '.' in local part
        'info@support.\u2067example.com', // RLI after subdomain '.'
        'mark@example.c\u2068om', // FSI inside TLD
        'tom.\u2069adams@example.com', // PDI after '.' in local part
        '\u200Fjohnny.smith@\u200Fexample.com', // Multiple Unicode,
        '\u2069\u202C\u200F@example.com', // Only Unicode character case with domain
        '\u202A\u200C\u200D\u200F\u2069', // Only Unicode character case without domain
      ];

      const expectedCleanedResult = [
        'dave.smith@example.com',
        'john.doe@test.com',
        'alexdoe@somewhere.com',
        'sam@example.net',
        'alice@example.org',
        'kate.jones@domain.com',
        'roger+sales@company.com',
        'chris@example.com',
        'mary@contoso.com',
        'anna.smith@mysite.com',
        'info@support.example.com',
        'mark@example.com',
        'tom.adams@example.com',
        'johnny.smith@example.com',
      ];

      // Verify that the Unicode does exist in the email
      unicodeEmails.forEach((unicodeEmail) => {
        expect(hasFormatChar(unicodeEmail)).toBe(true);
      });

      const expectedResult = { ...baseResults };
      expectedResult.validEmails = expectedCleanedResult;
      expectedResult.validEmailIndices = range(expectedCleanedResult.length);
      expectedResult.invalidEmailIndices = [14];
      expectedResult.invalidEmails = ['@example.com'];

      // Validate that we do validate email addresses correctly
      const emailValidation = validateEmailAddresses(unicodeEmails);
      expect(emailValidation).toEqual(expectedResult);

      // Validate that we do parse out the Unicode characters.
      emailValidation.validEmails.forEach((validEmail) => {
        expect(hasFormatChar(validEmail)).toBe(false);
      });
    });

    it('returns invalid email addresses and indices', () => {
      const invalidEmails = ['bobbyb', 'yooooooo3.a.x.y', 'argh@', 'blargh@.co.uk'];
      const expectedResult = { ...baseResults };
      expectedResult.invalidEmails = invalidEmails;
      expectedResult.invalidEmailIndices = range(invalidEmails.length);
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

  describe('validate emails and ids extraction', () => {
    it('extracted correct emails and ids from textarea and csv', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_TEXT_FORM_DATA] = [
        'abc@example.com,000000000000ABCABC',
        'asdf@example.com,',
        'zzz@example.com,000000000000XYZXYZ',
      ].join('\n');
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = [
        'one@example.com,000000000000YYYYYY',
        'two@example.com,000000000000ZZZZZZ',
        'three@example.com,000000000000ABCDDD',
        'wow@example.com,',
        'abc@example.com,000000000000ABCABC',
        'ama@example.com',
      ];
      const userEmails = [
        'abc@example.com',
        'asdf@example.com',
        'zzz@example.com',
        'one@example.com',
        'two@example.com',
        'three@example.com',
        'wow@example.com',
        'ama@example.com',
      ];

      const salesforceIds = extractSalesforceIds(formData, userEmails);
      expect(salesforceIds).toEqual([
        '000000000000ABCABC',
        '',
        '000000000000XYZXYZ',
        '000000000000YYYYYY',
        '000000000000ZZZZZZ',
        '000000000000ABCDDD',
        '',
        undefined,
      ]);
      expect(userEmails.length).toEqual(salesforceIds.length);
    });

    it('extracted correct emails and ids from textarea only', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_TEXT_FORM_DATA] = [
        'aaa@example.com,000000000000ABCABC',
        'bbb@example.com,',
        'ccc@example.com,000000000000XYZXYZ',
        'ddd@example.com',
      ].join('\n');

      const userEmails = returnValidatedEmails(formData);
      expect(userEmails).toEqual(['aaa@example.com', 'bbb@example.com', 'ccc@example.com', 'ddd@example.com']);
      const salesforceIds = extractSalesforceIds(formData, userEmails);
      expect(salesforceIds).toEqual([
        '000000000000ABCABC',
        '',
        '000000000000XYZXYZ',
        undefined,
      ]);
      expect(userEmails.length).toEqual(salesforceIds.length);
    });

    it('extracted correct emails and ids from csv only', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = [
        'eee@example.com,000000000000YYYYYY',
        'fff@example.com,',
        'ggg@example.com,000000000000ZZZZZZ',
        'hhh@example.com',
      ];

      const userEmails = returnValidatedEmails(formData);
      expect(userEmails).toEqual(['eee@example.com', 'fff@example.com', 'ggg@example.com', 'hhh@example.com']);
      const salesforceIds = extractSalesforceIds(formData, userEmails);
      expect(salesforceIds).toEqual([
        '000000000000YYYYYY',
        '',
        '000000000000ZZZZZZ',
        undefined,
      ]);
      expect(userEmails.length).toEqual(salesforceIds.length);
    });

    it('returns no salesforce ids for emails only', () => {
      const formData = new FormData();
      formData[EMAIL_ADDRESS_TEXT_FORM_DATA] = [
        'abc@example.com',
        'asdf@example.com,',
      ].join('\n');
      formData[EMAIL_ADDRESS_CSV_FORM_DATA] = [
        'one@example.com,',
        'two@example.com',
      ];

      const userEmails = returnValidatedEmails(formData);
      expect(userEmails).toEqual(['abc@example.com', 'asdf@example.com', 'one@example.com', 'two@example.com']);
      const salesforceIds = extractSalesforceIds(formData, userEmails);
      expect(salesforceIds).toEqual(undefined);
    });
  });
});
