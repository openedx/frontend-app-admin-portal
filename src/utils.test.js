import {
  camelCaseDict,
  camelCaseDictArray,
  snakeCaseDict,
  snakeCaseFormData,
  pollAsync,
  isValidNumber,
  defaultQueryClientRetryHandler,
} from './utils';

describe('utils', () => {
  describe('camel casing methods', () => {
    it('formats dictionaries into camel case', () => {
      const startingSnakeCaseDict = { snake_case_key: 'foobar' };
      const expectedCamelCaseDict = { snakeCaseKey: 'foobar' };
      expect(camelCaseDict(startingSnakeCaseDict)).toEqual(
        expectedCamelCaseDict,
      );
    });
    it('does not format dictionary value', () => {
      const startingDict = { fooBar: 'example_value' };
      expect(camelCaseDict(startingDict)).toEqual(startingDict);
    });
    it('formats an array of dictionaries into camel case', () => {
      const snakeCaseDictArray = [
        { foo_bar: 'example_value' },
        { ayy_lmao: 'example_value' },
      ];
      const expectedCamelCaseArray = [
        { fooBar: 'example_value' },
        { ayyLmao: 'example_value' },
      ];
      expect(camelCaseDictArray(snakeCaseDictArray)).toEqual(
        expectedCamelCaseArray,
      );
    });
  });

  describe('snake casing methods', () => {
    it('formats dictionaries into snake case', () => {
      const startingSnakeCaseDict = { snakeCaseKey: 'foobar' };
      const expectedCamelCaseDict = { snake_case_key: 'foobar' };
      expect(snakeCaseDict(startingSnakeCaseDict)).toEqual(
        expectedCamelCaseDict,
      );
    });
    it('does not format dictionary value', () => {
      const startingDict = { foo_bar: 'example_value' };
      expect(snakeCaseDict(startingDict)).toEqual(startingDict);
    });
    it('format form data to snake case', () => {
      const camelCaseFormData = new FormData();
      camelCaseFormData.append('userName', 'ayyLmao');
      expect(snakeCaseFormData(camelCaseFormData).get('user_name')).toEqual(
        'ayyLmao',
      );
    });
  });

  describe('async polling', () => {
    it('polls until truthy return value', async () => {
      const mockPoll = jest.fn();
      mockPoll
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValue(true);
      const pollReturn = await pollAsync(mockPoll, 1000, 300);
      expect(pollReturn).toEqual(true);
      expect(mockPoll).toBeCalledTimes(3);
    });
    it('polls until condition', async () => {
      const mockPoll = jest.fn();
      mockPoll.mockReturnValueOnce(0).mockReturnValueOnce(1).mockReturnValue(2);
      const pollReturn = await pollAsync(mockPoll, 1000, 300, (val) => val > 1);
      expect(pollReturn).toEqual(2);
      expect(mockPoll).toBeCalledTimes(3);
    });
    it('times out', async () => {
      const mockPoll = jest.fn();
      mockPoll.mockReturnValue(false);
      const pollReturn = await pollAsync(mockPoll, 1000, 300);
      expect(pollReturn).toEqual(false);
      expect(mockPoll).toBeCalledTimes(4);
    });
  });

  describe('validations', () => {
    it('detects valid number', () => {
      expect(isValidNumber(1)).toEqual(true);
      expect(isValidNumber('1')).toEqual(true);
      expect(isValidNumber(Infinity)).toEqual(true);
      expect(isValidNumber('One')).toEqual(false);
      expect(isValidNumber({})).toEqual(false);
      expect(isValidNumber(undefined)).toEqual(false);
    });
  });

  describe('defaultQueryClientRetryHandler', () => {
    const mockError404 = { customAttributes: { httpErrorStatus: 404 } };
    const mockError500 = { customAttributes: { httpErrorStatus: 500 } };

    it.each([3, 4])('return false if failureCount >= 3 (failureCount: %s)', (failureCount) => {
      const result = defaultQueryClientRetryHandler(failureCount, mockError500);
      expect(result).toEqual(false);
    });

    it('return false if error is a 404 HTTP status code', () => {
      const result = defaultQueryClientRetryHandler(1, mockError404);
      expect(result).toEqual(false);
    });

    it.each([1, 2])('return true if first failure and error is not a 404 (failureCount: %s)', (failureCount) => {
      const result = defaultQueryClientRetryHandler(failureCount, mockError500);
      expect(result).toEqual(true);
    });
  });
});
