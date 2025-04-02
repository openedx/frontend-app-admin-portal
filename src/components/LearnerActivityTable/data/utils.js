import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

export const trackDataTableEvent = ({
  shouldTrackRef,
  enterpriseId,
  eventName,
  tableId,
  options,
}) => {
  if (shouldTrackRef.current) {
    // track event only after original API query to avoid sending event on initial page load
    // only track event when user performs manual data operation (e.g., pagination, sort, filter)
    sendEnterpriseTrackEvent(
      enterpriseId,
      eventName,
      {
        tableId,
        ...options,
      },
    );
  } else {
    // set to true to enable tracking events on future API queries
    // eslint-disable-next-line no-param-reassign
    shouldTrackRef.current = true;
  }

  return shouldTrackRef.current;
};

export const updateUrlWithPageNumber = (tableId, pageNumber, location, navigate, replace = true) => {
  const newQueryParams = new URLSearchParams(location.search);

  if (pageNumber !== 1) { // Default page is 1
    newQueryParams.set(`${tableId}-page`, pageNumber);
  } else {
    newQueryParams.delete(`${tableId}-page`);
  }

  const newSearch = newQueryParams.toString();
  const queryString = newSearch ? `?${newSearch}` : '';
  navigate(`${location.pathname}${queryString}`, { replace });
};
