import {
  camelCaseDict, camelCaseDictArray, snakeCaseDict, snakeCaseFormData,
} from './utils';

describe('utils', () => {
  describe('camel casing methods', () => {
    it('formats dictionaries into camel case', () => {
      const startingSnakeCaseDict = { snake_case_key: 'foobar' };
      const expectedCamelCaseDict = { snakeCaseKey: 'foobar' };
      expect(camelCaseDict(startingSnakeCaseDict)).toEqual(expectedCamelCaseDict);
    });
    it('does not format dictionary value', () => {
      const startingDict = { fooBar: 'example_value' };
      expect(camelCaseDict(startingDict)).toEqual(startingDict);
    });
    it('formats an array of dictionaries into camel case', () => {
      const snakeCaseDictArray = [{ foo_bar: 'example_value' }, { ayy_lmao: 'example_value' }];
      const expectedCamelCaseArray = [{ fooBar: 'example_value' }, { ayyLmao: 'example_value' }];
      expect(camelCaseDictArray(snakeCaseDictArray)).toEqual(expectedCamelCaseArray);
    });
  });

  describe('snake casing methods', () => {
    it('formats dictionaries into snake case', () => {
      const startingSnakeCaseDict = { snakeCaseKey: 'foobar' };
      const expectedCamelCaseDict = { snake_case_key: 'foobar' };
      expect(snakeCaseDict(startingSnakeCaseDict)).toEqual(expectedCamelCaseDict);
    });
    it('does not format dictionary value', () => {
      const startingDict = { foo_bar: 'example_value' };
      expect(snakeCaseDict(startingDict)).toEqual(startingDict);
    });
    it('format form data to snake case', () => {
      const camelCaseFormData = new FormData();
      camelCaseFormData.append('userName', 'ayyLmao');
      expect(snakeCaseFormData(camelCaseFormData).get('user_name')).toEqual('ayyLmao');
    });
  });
});
