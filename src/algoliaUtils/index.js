import qs from 'query-string';

export const DEBOUNCE_TIME_MILLIS = 400;
export const ALGOLIA_KEYS_TO_EXCLUDE = ['configure'];

export const excludeKeys = (obj, keysToExclude) => {
  const sanitizedObj = {};
  Object.keys(obj)
    .filter(key => !keysToExclude.includes(key))
    .forEach(key => { sanitizedObj[key] = obj[key]; });
  return sanitizedObj;
};

export const createURL = state => {
  const sanitizedState = excludeKeys(state, ALGOLIA_KEYS_TO_EXCLUDE);
  return `?${qs.stringify(sanitizedState)}`;
};

const validateQuerystring = (queryObj) => {
  const validatedQueryObj = { ...queryObj };
  const { page } = queryObj;
  // if the user tries to input an invalid page, put them on page 1
  if (!parseInt(page, 10) || parseInt(page, 10) <= 1) {
    validatedQueryObj.page = 1;
  }
  return validatedQueryObj;
};

export const searchStateToUrl = ({ location, searchState }) => (searchState ? `${location.pathname}${createURL(searchState)}` : '');

export const urlToSearchState = ({ search }) => {
  const parsedSearch = qs.parse(search.slice(1));
  const validatedSearch = validateQuerystring(parsedSearch);
  return validatedSearch;
};
