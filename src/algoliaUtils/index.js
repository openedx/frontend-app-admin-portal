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
  const queryParams = new URLSearchParams();
  Object.entries(sanitizedState).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item !== 'undefined') {
          queryParams.append(key, item);
        }
      });
      return;
    }
    if (typeof value !== 'undefined') {
      queryParams.set(key, value);
    }
  });
  return `?${queryParams.toString()}`;
};

const validateQueryParams = (queryParams) => {
  const page = queryParams.get('page');
  if (!parseInt(page, 10) || parseInt(page, 10) <= 1) {
    // if the user tries to input an invalid page, put them on page 1 which is the
    // default page, so no page parameter is necessary
    queryParams.delete('page');
  }
  return queryParams;
};

export const searchStateToUrl = ({ location, searchState }) => (searchState ? `${location.pathname}${createURL(searchState)}` : '');

export const urlToSearchState = ({ search }) => {
  const queryParams = new URLSearchParams(search);
  const validatedSearch = validateQueryParams(queryParams);
  return validatedSearch;
};
