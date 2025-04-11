import { logError } from '@edx/frontend-platform/logging';
import { createIntl } from '@edx/frontend-platform/i18n';
import { saveAs } from 'file-saver';

import {
  camelCaseDict,
  camelCaseDictArray,
  defaultQueryClientRetryHandler,
  downloadCsv,
  getFromLocalStorage,
  getTimeStampedFilename,
  i18nFormatPassedTimestamp,
  i18nFormatProgressStatus,
  isValidNumber,
  pollAsync,
  queryCacheOnErrorHandler,
  removeStringsFromList,
  removeStringsFromListCaseInsensitive,
  saveToLocalStorage,
  snakeCaseDict,
  snakeCaseFormData,
  snakeCaseObjectToForm,
  splitAndTrim,
  applySortByToOptions,
  trackDataTableEvent,
  updateUrlWithPageNumber,

} from './utils';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));
// Needed to mock before import so jest uses the mock correctly
// eslint-disable-next-line import/order, import/first
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}));

jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date('2024-01-20'));

global.Blob = jest.fn();

const intl = createIntl({
  locale: 'en',
  messages: {},
});

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
    it('converts object to form data', () => {
      const originalObject = { captainCrunch: 'allberries' };
      const formData = snakeCaseObjectToForm(originalObject);
      expect(formData instanceof FormData).toEqual(true);
      expect(formData.get('captain_crunch')).toEqual('allberries');
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
  describe('queryCacheOnErrorHandler', () => {
    it('calls logError', () => {
      const error = 'hello!';
      const query = { meta: { errorMessage: "hi, I'm an error" } };
      queryCacheOnErrorHandler(error, query);
      expect(logError).toHaveBeenCalledWith("hi, I'm an error");
    });
  });
  describe('i18nFormatPassedTimestamp', () => {
    it('returns correct value', () => {
      const passedTimestamp = i18nFormatPassedTimestamp({ intl, timestamp: '2021-01-01T00:00:00Z' });
      expect(passedTimestamp).toEqual('January 1, 2021');

      const notPassed = i18nFormatPassedTimestamp({ intl, timestamp: undefined });
      expect(notPassed).toEqual('Has not passed');
    });
  });
  describe('i18nFormatProgressStatus', () => {
    it('returns correct progress status', () => {
      const allProgressStatuses = [
        'In Progress', 'Passed', 'Audit Access Expired',
        'Failed', 'Cancelled', 'Enrolled', 'Pass', 'Pending', null,
      ];
      allProgressStatuses.forEach((progressStatus) => {
        const formattedProgressStatus = i18nFormatProgressStatus({ intl, progressStatus });
        expect(formattedProgressStatus).toEqual(progressStatus);
      });
    });
  });
  describe('getTimeStampedFilename', () => {
    it('generates timestamped filename', () => {
      const expectedFileName = '2024-01-20-somefile.txt';
      expect(getTimeStampedFilename('somefile.txt')).toEqual(expectedFileName);
    });
  });
  describe('downloadCsv', () => {
    it('downloads properly formatted csv', () => {
      const fileName = 'somefile.csv';
      const data = [
        {
          a: 1, b: 2, c: 3, d: 4,
        },
        {
          a: 'apple', b: 'banana', c: 'comma, please', d: 'donut',
        },
      ];
      const headers = ['a', 'b', 'c', 'd'];
      const dataEntryToRow = (entry) => {
        const changeItUp = (field) => (isValidNumber(field) ? field + 1 : field);
        const {
          a, b, c, d,
        } = entry;
        return [a, b, c, d].map(changeItUp);
      };
      downloadCsv(fileName, data, headers, dataEntryToRow);
      const expectedBlob = ['a,b,c,d\n2,3,4,5\napple,banana,"comma, please",donut'];
      expect(global.Blob).toHaveBeenCalledWith(expectedBlob, {
        type: 'text/csv',
      });
      expect(saveAs).toHaveBeenCalledWith({}, fileName);
    });
  });
  describe('splitAndTrim', () => {
    it('returns split and trimmed string array', () => {
      const csvStr = 'a,b,,c ,';
      expect(splitAndTrim(',', csvStr)).toEqual(['a', 'b', 'c']);
    });
  });
  describe('removeStringsFromList', () => {
    it('should remove strings from list', () => {
      const list = ['a', 'b', 'c', 'd'];
      const remove = ['b', 'd'];
      expect(removeStringsFromList(list, remove)).toEqual(['a', 'c']);
    });
  });
  describe('removeStringsFromListCaseInsensitive', () => {
    it('should remove strings from list in a case insensitive way', () => {
      const list = ['ab', 'bc', 'cd', 'de', 'Ef'];
      const remove = ['Bc', 'de', 'eF'];
      expect(removeStringsFromListCaseInsensitive(list, remove)).toEqual(['ab', 'cd']);
    });
  });
  describe('localStorage utils', () => {
    const originalLocalStorage = global.localStorage;

    beforeEach(() => {
      global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
      };
    });

    afterEach(() => {
      global.localStorage = originalLocalStorage;
    });

    describe('saveToLocalStorage', () => {
      it('saves string value to localStorage', () => {
        saveToLocalStorage('testKey', 'testValue');
        expect(localStorage.setItem).toHaveBeenCalledWith('testKey', '"testValue"');
      });

      it('saves object to localStorage', () => {
        const testObject = { foo: 'bar', num: 123 };
        saveToLocalStorage('testKey', testObject);
        expect(localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(testObject));
      });
    });

    describe('getFromLocalStorage', () => {
      it('retrieves and parses value from localStorage', () => {
        const testObject = { foo: 'bar', num: 123 };
        localStorage.getItem.mockReturnValue(JSON.stringify(testObject));

        const result = getFromLocalStorage('testKey');

        expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
        expect(result).toEqual(testObject);
      });

      it('returns null when key not found', () => {
        localStorage.getItem.mockReturnValue(null);

        const result = getFromLocalStorage('nonExistentKey');

        expect(result).toBeNull();
      });
      describe('applySortByToOptions', () => {
        it('should not modify options when sortBy is empty', () => {
          const options = {};
          const sortBy = [];
          const apiFieldsForColumnAccessor = { someColumn: { key: 'column_name' } };

          applySortByToOptions(sortBy, apiFieldsForColumnAccessor, options);

          expect(options).toEqual({});
        });

        it('should correctly apply sorting options when sortBy is provided', () => {
          const options = {};
          const sortBy = [
            { id: 'someColumn', desc: false },
            { id: 'anotherColumn', desc: true },
          ];
          const apiFieldsForColumnAccessor = {
            someColumn: { key: 'column_name' },
            anotherColumn: { key: 'another_column' },
          };

          applySortByToOptions(sortBy, apiFieldsForColumnAccessor, options);

          expect(options).toEqual({
            ordering: 'column_name,-another_column', // Ensure ordering matches the expected format
          });
        });

        it('should handle missing keys in apiFieldsForColumnAccessor gracefully', () => {
          const options = {};
          const sortBy = [
            { id: 'nonExistentColumn', desc: false },
            { id: 'someColumn', desc: true },
          ];
          const apiFieldsForColumnAccessor = {
            someColumn: { key: 'column_name' },
          };

          applySortByToOptions(sortBy, apiFieldsForColumnAccessor, options);

          expect(options).toEqual({
            ordering: '-column_name', // Only column_name should be included in ordering
          });
        });

        it('should return undefined if sortBy is not provided', () => {
          const options = {};
          const sortBy = null;
          const apiFieldsForColumnAccessor = { someColumn: { key: 'column_name' } };

          applySortByToOptions(sortBy, apiFieldsForColumnAccessor, options);

          expect(options).toEqual({});
        });
      });
      describe('trackDataTableEvent', () => {
        beforeEach(() => {
          jest.clearAllMocks();
        });

        it('sends track event when shouldTrackRef.current is true', () => {
          const shouldTrackRef = { current: true };
          const enterpriseId = 'test-enterprise-id';
          const eventName = 'test-event-name';
          const tableId = 'test-table-id';
          const options = { page: 1, pageSize: 10 };

          const result = trackDataTableEvent({
            shouldTrackRef,
            enterpriseId,
            eventName,
            tableId,
            options,
          });

          expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
            enterpriseId,
            eventName,
            {
              tableId,
              ...options,
            },
          );
          expect(result).toBe(true);
          expect(shouldTrackRef.current).toBe(true);
        });

        it('does not send track event but sets shouldTrackRef to true when initial value is false', () => {
          const shouldTrackRef = { current: false };
          const enterpriseId = 'test-enterprise-id';
          const eventName = 'test-event-name';
          const tableId = 'test-table-id';
          const options = { page: 1, pageSize: 10 };

          const result = trackDataTableEvent({
            shouldTrackRef,
            enterpriseId,
            eventName,
            tableId,
            options,
          });

          expect(sendEnterpriseTrackEvent).not.toHaveBeenCalled();
          expect(result).toBe(true);
          expect(shouldTrackRef.current).toBe(true);
        });

        it('handles undefined options properly', () => {
          const shouldTrackRef = { current: true };
          const enterpriseId = 'test-enterprise-id';
          const eventName = 'test-event-name';
          const tableId = 'test-table-id';

          trackDataTableEvent({
            shouldTrackRef,
            enterpriseId,
            eventName,
            tableId,
          });

          expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
            enterpriseId,
            eventName,
            {
              tableId,
            },
          );
        });
      });
      describe('updateUrlWithPageNumber', () => {
        const mockNavigate = jest.fn();
        const createMockLocation = (search = '') => ({
          pathname: '/test-path',
          search,
        });

        beforeEach(() => {
          jest.clearAllMocks();
        });

        it('adds page number to URL when pageNumber is not 1', () => {
          const location = createMockLocation();
          const pageNumber = 3;
          const id = 'test-table';

          updateUrlWithPageNumber(id, pageNumber, location, mockNavigate);

          expect(mockNavigate).toHaveBeenCalledWith('/test-path?test-table-page=3', { replace: true });
        });

        it('removes page number from URL when pageNumber is 1', () => {
          const location = createMockLocation('?test-table-page=3&filter=active');
          const pageNumber = 1;
          const id = 'test-table';

          updateUrlWithPageNumber(id, pageNumber, location, mockNavigate);

          expect(mockNavigate).toHaveBeenCalledWith('/test-path?filter=active', { replace: true });
        });

        it('respects existing query parameters when adding page number', () => {
          const location = createMockLocation('?filter=active&sort=name');
          const pageNumber = 2;
          const id = 'test-table';

          updateUrlWithPageNumber(id, pageNumber, location, mockNavigate);

          expect(mockNavigate).toHaveBeenCalledWith('/test-path?filter=active&sort=name&test-table-page=2', { replace: true });
        });

        it('uses replace=false when specified', () => {
          const location = createMockLocation();
          const pageNumber = 2;
          const id = 'test-table';

          updateUrlWithPageNumber(id, pageNumber, location, mockNavigate, false);

          expect(mockNavigate).toHaveBeenCalledWith('/test-path?test-table-page=2', { replace: false });
        });
      });
      describe('saveToLocalStorage', () => {
        it('saves string value to localStorage', () => {
          saveToLocalStorage('testKey', 'testValue');
          expect(global.localStorage.setItem).toHaveBeenCalledWith('testKey', '"testValue"');
        });

        it('saves object value to localStorage', () => {
          const value = { foo: 'bar' };
          saveToLocalStorage('testObject', value);
          expect(global.localStorage.setItem).toHaveBeenCalledWith('testObject', JSON.stringify(value));
        });
      });

      describe('getFromLocalStorage', () => {
        it('retrieves and parses stored string value', () => {
          global.localStorage.getItem.mockReturnValue('"testValue"');
          const result = getFromLocalStorage('testKey');
          expect(global.localStorage.getItem).toHaveBeenCalledWith('testKey');
          expect(result).toEqual('testValue');
        });

        it('retrieves and parses stored object value', () => {
          const storedValue = { foo: 'bar' };
          global.localStorage.getItem.mockReturnValue(JSON.stringify(storedValue));
          const result = getFromLocalStorage('testObject');
          expect(global.localStorage.getItem).toHaveBeenCalledWith('testObject');
          expect(result).toEqual(storedValue);
        });

        it('returns null for non-existent key', () => {
          global.localStorage.getItem.mockReturnValue(null);
          const result = getFromLocalStorage('nonExistentKey');
          expect(result).toBeNull();
        });

        it('handles malformed JSON gracefully', () => {
          global.localStorage.getItem.mockReturnValue('not valid JSON');
          const result = getFromLocalStorage('badJSON');
          expect(result).toBeNull();
        });
      });
    });
  });
});
