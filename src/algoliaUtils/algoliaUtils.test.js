import qs from 'query-string';
import {
  excludeKeys, createURL, ALGOLIA_KEYS_TO_EXCLUDE, searchStateToUrl, urlToSearchState,
} from '.';

describe('algoliaUtils', () => {
  describe('excludeKeys', () => {
    it('filters keys out of an object', () => {
      const result = excludeKeys(Object.freeze({
        bears__rus: 12,
        badKey: 'foo',
        someotherkey: [],
        extremelyBadKey: 'winiewuzhere',
      }), ['badKey', 'extremelyBadKey']);
      expect(result).toEqual({
        bears__rus: 12,
        someotherkey: [],
      });
    });
  });

  describe('createUrl', () => {
    it('builds a querystring', () => {
      const result = createURL(Object.freeze({
        page: 2,
        filters: [1, 2],
      }));
      expect(result).toContain('page=2');
      expect(result).toContain('filters=1&filters=2');
    });
    test.each(ALGOLIA_KEYS_TO_EXCLUDE)('excludes %p key that should not be set for algolia', (key) => {
      const result = createURL(Object.freeze({
        page: 2,
        filters: [1],
        configure: 'foo',
      }));
      expect(result).not.toContain(key);
    });
  });

  describe('searchStateToUrl', () => {
    it('converts search state to a url', () => {
      const location = { pathname: '/here' };
      const searchState = {
        page: 3,
        configure: 'bar',
      };
      const result = searchStateToUrl({ location, searchState });
      expect(result).toEqual('/here?page=3');
    });
  });

  describe('Validate querystring', () => {
    test.each(['-1', -20, 'foo'])('sends user to the first page if page number is invalid: page=%p', (pageNo) => {
      const search = {
        page: pageNo,
      };

      const result = urlToSearchState({ search: `?${qs.stringify(search)}` });
      expect(result).toEqual({
        page: 1,
      });
    });
    test.each([1, '20', '3'])('accepts valid pages from the querystring: page=%p', (pageNo) => {
      const search = {
        page: pageNo,
      };
      const result = urlToSearchState({ search: `?${qs.stringify(search)}` });
      expect(result).toEqual(search);
    });
  });

  describe('urlToSearchState', () => {
    it('returns a validated search object', () => {
      const search = {
        page: 'foo',
        filters: ['foo', 'bar'],
      };
      const result = urlToSearchState({ search: `?${qs.stringify(search)}` });
      expect(result).toEqual({
        page: 1,
        filters: search.filters,
      });
    });
  });
});
