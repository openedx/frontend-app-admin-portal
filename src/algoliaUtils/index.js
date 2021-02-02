import qs from 'query-string';

export const DEBOUNCE_TIME = 400;
const ALGOLIA_KEYS_TO_EXCLUDE = ['configure'];

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
  if (page <= 1) {
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
